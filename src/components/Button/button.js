import React from 'react'

const Button = ({ariaLabel,
  styleName}) => {
  return (
    <button className={styleName}>{ariaLabel}</button>
  )
}

export default Button