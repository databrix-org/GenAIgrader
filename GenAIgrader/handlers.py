import json
from nbgrader.apps import NbGraderAPI
from nbgrader.coursedir import CourseDirectory
from traitlets.config import Config
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
import os
import traceback  # Add this import
from nbgrader.api import Gradebook
from nbgrader.exchange import ExchangeReleaseAssignment, ExchangeList


def getconfig():
    
    # Read the nbgrader_config.txt file
    config_path = 'nbgrader_config.txt'
    config_vars = {}
    with open(config_path, 'r') as config_file:
        for line in config_file:
            key, value = line.strip().split(' = ')
            config_vars[key] = value.strip('"')
    # Create a custom config object
    config = Config()
    config.CourseDirectory.course_id = config_vars.get('course_id')
    config.CourseDirectory.root = config_vars.get('CourseDirectory')
    config.Exchange.root = config_vars.get('ExchangeDirectory')
    return config, config_vars, config_path


class AssignmentListHandler(APIHandler):
    def initialize(self):
        try:
            self.log.info("Initializing RouteHandler")
            config, config_vars, config_path = getconfig()
            self.log.info(f"Attempting to read config file: {config_path}")
            self.log.info("Custom config object created", config_vars)
            self.api = NbGraderAPI(config=config)
            self.log.info("NbGraderAPI initialized successfully")

        except Exception as e:
            self.log.error(f"Error initializing RouteHandler: {str(e)}")
            self.log.error(traceback.format_exc())
            raise

    @tornado.web.authenticated
    def get(self):
        try:
            self.log.info("RouteHandler.get method called")

            # Get the list of assignments using the pre-initialized API
            all_assignments = self.api.get_source_assignments()
            released_assignments = self.api.get_released_assignments()
            self.log.info(f"all assignments: {all_assignments}")
            self.log.info(f"released assignments: {released_assignments}")

            # Convert set to list for JSON serialization
            all_assignments_list = list(all_assignments)
            released_assignments_list = list(released_assignments)

            # Prepare the response
            response = {
                "success": True,
                "all_assignments": all_assignments_list,
                "released_assignments": released_assignments_list,
            }

            self.finish(json.dumps(response))
            self.log.info("Response sent successfully")

        except Exception as e:
            self.log.error(f"Uncaught exception in RouteHandler.get: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))


class CreateAssignmentHandler(APIHandler):
    def initialize(self):
        try:
            self.log.info("Initializing RouteHandler")
            config, config_vars, config_path = getconfig()
            self.log.info(f"Attempting to read config file: {config_path}")
            self.log.info("Custom config object created", config_vars)
            self.api = NbGraderAPI(config=config)
            self.log.info("NbGraderAPI initialized successfully")

        except Exception as e:
            self.log.error(f"Error initializing RouteHandler: {str(e)}")
            self.log.error(traceback.format_exc())
            raise

    @tornado.web.authenticated
    def post(self):
        try:
            self.log.info("CreateAssignmentHandler.post method called")

            # Get the assignment name from the request
            data = json.loads(self.request.body)
            assignment_name = data.get('assignment_name')

            if not assignment_name:
                raise ValueError("Assignment name is required")

            # Get the course directory path
            course_dir = self.api.coursedir.root

            # Create the source directory if it doesn't exist
            source_dir = os.path.join(course_dir, 'source')
            os.makedirs(source_dir, exist_ok=True)

            # Create the new assignment directory
            new_assignment_dir = os.path.join(source_dir, assignment_name)
            os.makedirs(new_assignment_dir, exist_ok=True)

            self.log.info(f"Created new assignment directory: {new_assignment_dir}")

            # Prepare the response
            response = {
                "success": True,
                "message": f"Assignment '{assignment_name}' created successfully",
                "directory": new_assignment_dir  # Add the directory path to the response
            }

            self.finish(json.dumps(response))
            self.log.info("Response sent successfully")

        except Exception as e:
            self.log.error(f"Error in CreateAssignmentHandler.post: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))


class ConfigHandler(APIHandler):
    @tornado.web.authenticated
    def get(self):
        try:
            config, config_vars, config_path = getconfig()
            response = {
                "success": True,
                "config": {
                    "course_id": config_vars.get('course_id'),
                    "course_directory": config_vars.get('CourseDirectory'),
                    "exchange_directory": config_vars.get('ExchangeDirectory')
                }
            }
            self.finish(json.dumps(response))
        except Exception as e:
            self.log.error(f"Error in ConfigHandler.get: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))


class ManageAssignmentHandler(APIHandler):
    def initialize(self):
        try:
            self.log.info("Initializing ManageAssignmentHandler")
            config, config_vars, config_path = getconfig()
            self.log.info(f"Attempting to read config file: {config_path}")
            self.log.info("Custom config object created", config_vars)
            self.api = NbGraderAPI(config=config)
            self.log.info("NbGraderAPI initialized successfully")
            self.HomeDir = config_vars.get('HomeDirectory')
            self.CourseDir = config_vars.get('CourseDirectory')
        except Exception as e:
            self.log.error(f"Error initializing ManageAssignmentHandler: {str(e)}")
            self.log.error(traceback.format_exc())
            raise

    @tornado.web.authenticated
    def get(self):
        try:
            self.log.info("ManageAssignmentHandler.get method called")

            # Get the assignment name from the query parameters
            assignment_id = self.get_argument('assignment_name', None)

            if not assignment_id:
                raise ValueError("Assignment name is required")

            # Get assignment details
            assignment = self.api.get_assignment(assignment_id)

            # Get notebooks for the assignment
            notebooks = self.api.get_notebooks(assignment_id)

            # Get other files
            assignment_dir = os.path.join(self.CourseDir, 'source', assignment_id)
            other_files = [f for f in os.listdir(assignment_dir) if not f.endswith('.ipynb')]
            # Get assignment file paths
            assignment_file_paths = {}
            for notebook in notebooks:
                notebook_filename = f"{notebook['name']}.ipynb"
                assignment_file_paths[notebook['name']] = os.path.join(assignment_dir, notebook_filename)

            # Prepare the response
            response = {
                "success": True,
                "notebooks": notebooks,
                "assignment_dir": assignment_dir,
                "other_files": other_files,
                "assignment_file_paths": assignment_file_paths,
                "home_dir": self.HomeDir
            }

            self.finish(json.dumps(response))
            self.log.info("Response sent successfully")

        except Exception as e:
            self.log.error(f"Error in ManageAssignmentHandler.get: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))


class SubmissionsHandler(APIHandler):
    def initialize(self):
        try:
            self.log.info("Initializing SubmissionsHandler")
            config, config_vars, config_path = getconfig()
            self.log.info(f"Attempting to read config file: {config_path}")
            self.log.info("Custom config object created", config_vars)
            self.api = NbGraderAPI(config=config)
            self.log.info("NbGraderAPI initialized successfully")
            
        except Exception as e:
            self.log.error(f"Error initializing SubmissionsHandler: {str(e)}")
            self.log.error(traceback.format_exc())
            raise

    @tornado.web.authenticated
    def get(self):
        try:
            self.log.info("SubmissionsHandler.get method called")

            # Get the assignment ID from the query parameters
            assignment_id = self.get_argument('assignment_id', None)

            if not assignment_id:
                raise ValueError("Assignment ID is required")

            # Get submissions for the assignment
            submissions = self.api.get_submissions(assignment_id)

            # Prepare the response
            response = {
                "success": True,
                "submissions": submissions
            }

            self.finish(json.dumps(response))
            self.log.info("Response sent successfully")

        except Exception as e:
            self.log.error(f"Error in SubmissionsHandler.get: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))

    @tornado.web.authenticated
    def post(self):
        try:
            self.log.info("SubmissionsHandler.post method called")

            # Get the assignment ID from the request body
            data = json.loads(self.request.body)
            assignment_id = data.get('assignment_id')

            if not assignment_id:
                raise ValueError("Assignment ID is required")

            # Collect the submitted assignment
            self.api.collect(assignment_id, update=True)

            # Prepare the response
            response = {
                "success": True,
                "message": f"Successfully collected submissions for assignment '{assignment_id}'",
            }

            self.finish(json.dumps(response))
            self.log.info("Response sent successfully")

        except Exception as e:
            self.log.error(f"Error in SubmissionsHandler.post: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))


class ReleaseHandler(APIHandler):
    def initialize(self):
        try:
            self.log.info("Initializing ReleaseHandler")
            config, config_vars, config_path = getconfig()
            self.log.info(f"Attempting to read config file: {config_path}")
            self.log.info("Custom config object created", config_vars)
            self.api = NbGraderAPI(config=config)
            self.log.info("NbGraderAPI initialized successfully")
        except Exception as e:
            self.log.error(f"Error initializing ReleaseHandler: {str(e)}")
            self.log.error(traceback.format_exc())
            raise

    @tornado.web.authenticated
    def post(self):
        try:
            self.log.info("ReleaseHandler.post method called")

            data = json.loads(self.request.body)
            assignment_id = data.get('assignment_id')

            if not assignment_id:
                raise ValueError("Assignment ID is required")

            self.api.generate_assignment(assignment_id)
            self.api.release_assignment(assignment_id)

            # Check if the assignment is now in the released assignments list
            released_assignments = self.api.get_released_assignments()
            if assignment_id in released_assignments:
                response = {
                    "success": True,
                    "message": f"Assignment '{assignment_id}' released successfully",
                }
            else:
                response = {
                    "success": False,
                    "message": f"Failed to release assignment '{assignment_id}'",
                }

            self.finish(json.dumps(response))
            self.log.info(f"Response sent: {response}")

        except Exception as e:
            self.log.error(f"Error in ReleaseHandler.post: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))

    @tornado.web.authenticated
    def delete(self):
        try:
            self.log.info("ReleaseHandler.delete method called")

            assignment_id = self.get_argument('assignment_id', None)

            if not assignment_id:
                raise ValueError("Assignment ID is required")

            self.api.unrelease(assignment_id)

            # Check if the assignment is no longer in the released assignments list
            released_assignments = self.api.get_released_assignments()
            if assignment_id not in released_assignments:
                response = {
                    "success": True,
                    "message": f"Assignment '{assignment_id}' unreleased successfully",
                }
            else:
                response = {
                    "success": False,
                    "message": f"Failed to unrelease assignment '{assignment_id}'",
                }

            self.finish(json.dumps(response))
            self.log.info(f"Response sent: {response}")

        except Exception as e:
            self.log.error(f"Error in ReleaseHandler.delete: {str(e)}")
            self.log.error(traceback.format_exc())
            self.finish(json.dumps({
                "success": False,
                "error": str(e)
            }))


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    handlers = [
        (url_path_join(base_url, "GenAIgrader", "list-assignments"), AssignmentListHandler),
        (url_path_join(base_url, "GenAIgrader", "create-assignment"), CreateAssignmentHandler),
        (url_path_join(base_url, "GenAIgrader", "get-config"), ConfigHandler),
        (url_path_join(base_url, "GenAIgrader", "manage-assignment"), ManageAssignmentHandler),
        (url_path_join(base_url, "GenAIgrader", "get-submissions"), SubmissionsHandler),
        (url_path_join(base_url, "GenAIgrader", "release-assignment"), ReleaseHandler)
    ]
    web_app.add_handlers(host_pattern, handlers)
