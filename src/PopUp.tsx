import React from 'react';
import '../style/PopUp.css';

interface PopUpProps {
  message: string;
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ message, onClose }) => (
  <div className="popup">
    <div className="popup-content">
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

export default PopUp;
