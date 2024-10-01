export interface BreadCrumbLink {
    name: string;
    link: string;
    isActive: boolean;
}
interface BreadCrumbProps {
    name: string
    links: BreadCrumbLink[]
    children: React.ReactNode
}

function BreadCrumb(props: BreadCrumbProps) {
    const { children, name, links } = props;

    return (
        // <div className="border-bottom pb-4 mb-4 ">
        <div className=" pb-1 mb-1 d-lg-flex align-items-center justify-content-between " >
            <div className=" mb-lg-0">
                <h1 className="ml-3 h2 fw-bold"> {name} </h1>
                <nav aria-label="breadcrumb" >
                    <ol className="breadcrumb" style={{ backgroundColor: "#F5F7FF" }}>
                        {links.map((link, index) => {
                            if (link.isActive) {
                                return (
                                    <li className="breadcrumb-item active" key={index} aria-current="page">
                                        {link.name}
                                    </li>
                                )
                            }
                            else {
                                return (
                                    <li className="breadcrumb-item" key={index}>
                                        <a href={link.link}> {link.name} </a>
                                    </li>
                                )
                            }
                        })}
                    </ol>
                </nav>
            </div>
            {children}
        </div>
    )
}

export default BreadCrumb;  