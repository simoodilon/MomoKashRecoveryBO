import React from 'react'

interface BodyLayoutProps {
    children: React.ReactNode
}

const BodyLayout = ({ children }: BodyLayoutProps) => {
    return (
        <div >

            {children}
        </div>
    )
}

export default BodyLayout
