// React Component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';


interface ButtonProps {
    name: string;
    onClick: () => void;
    icon?: IconDefinition;
    className?: string;

}

const Buttons = ({ name, onClick, icon, className = "" }: ButtonProps) => {

    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle = {
        borderRadius: "83px",
        backgroundColor: isHovered ? "#4B49AC" : "transparent", // Change hover background color here
        padding: "10px 20px",
        border: `2px solid ${isHovered ? "#3a388c" : "#4B49AC"}`, // Change border color on hover
        color: isHovered ? "#fff" : "#4B49AC", // Change text color on hover
        cursor: "pointer",
        transition: "all 0.3s ease"
    };

    return (
        <button
            type="button"
            className="add btn btn-primary mb-2 me-2"
            style={buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            {icon && <FontAwesomeIcon icon={icon} className="me-2" />}

            {name}
        </button>
    );
}

export default Buttons;
