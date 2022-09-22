import React from "react";

const Button = ({ ariaLabel, styleName, handleClick }) => {
  return (
    <button className={styleName} onClick={handleClick}>
      {ariaLabel}
    </button>
  );
};

export default Button;
