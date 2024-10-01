import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const convertArrayOfObjectsToCSV = (array: any[]) => {
    if (!array || array.length === 0) {
        return null; // Return null if array is empty or not provided
    }

    let result: string;
    const columnDelimiter = ',';
    const lineDelimiter = '\n';
    const keys = Object.keys(array[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    array.forEach(item => {
        let ctr = 0;
        keys.forEach(key => {
            if (ctr > 0) result += columnDelimiter;
            result += item[key as keyof any];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
};

const downloadCSV = (array: any[]) => {
    if (!array || array.length === 0) {
        return; // Do nothing if array is empty or not provided
    }

    const link = document.createElement('a');
    let csv = convertArrayOfObjectsToCSV(array);
    if (csv == null) return;

    const filename = 'export.csv';

    if (!csv.match(/^data:text\/csv/i)) {
        csv = `data:text/csv;charset=utf-8,${csv}`;
    }

    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', filename);
    link.click();
};

interface ExportProps {
    onExport: () => void;
    disabled: boolean;
    className?: string; // Add className prop
    name?: string; // Add name prop

}

const Export = ({ onExport, disabled, className, name }: ExportProps) => {
    const button = (
        <Button
            variant={name ? "" : "outline-primary"}
            onClick={onExport}
            disabled={disabled}
            className={className}
        >
            {name ? name : <i className="ti-download"></i>} {/* Conditionally render name or icon */}
        </Button>
    );

    return name ? (
        button
    ) : (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="tooltip-export">Download CSV</Tooltip>}
        >
            {button}
        </OverlayTrigger>
    );
};

interface ExportCSVProps {
    data: any[];
    className?: string; // Add className prop
    name?: string; // Add name prop

}

const ExportCSV = ({ data, className, name }: ExportCSVProps) => {
    // Disable the button if data is null, undefined, or empty
    const isDisabled = !data || data.length === 0;

    return (
        <Export
            onExport={() => downloadCSV(data)}
            disabled={isDisabled}
            className={className} // Pass className prop
            name={name}
        />
    );
};

export default ExportCSV;
