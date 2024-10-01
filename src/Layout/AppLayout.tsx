import React from 'react'
import Headerlayout from './Headerlayout'
import SettingsPanel from '../components/settingspanel'
import RightSidebar from '../components/rightsidebar'
import NavBar from './NavBar'
import BodyLayout from './BodyLayout'


interface ChildProps {
    children?: React.ReactNode;
}

const AppLayout = (props: ChildProps) => {
    return (
        <div>

            <Headerlayout />
            <div className="container-fluid page-body-wrapper" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                <RightSidebar />

                <NavBar />
                <div className="main-panel" >
                    <div className="content-wrapper" style={{ marginLeft: "0px" }}>
                        <BodyLayout children={props.children} />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AppLayout
