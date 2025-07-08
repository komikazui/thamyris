import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SearchProps {
    value?: string;
    pagination?: {
        per: number;
        page: number;
    };
}

interface TableProps<T> {
    columns: Record<string, (row: T) => React.ReactNode>;
    data: T[];
    onSearch: (search: SearchProps) => void;
    title?: string;
}

const TableComponent: React.FC<TableProps<any>> = ({ columns, data, onSearch, title }) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 15;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch({ value, pagination: { per: itemsPerPage, page: currentPage } });
    };

    const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
        <div className="bg-card w-full rounded-md p-2 sm:p-4">
            <h2 className="text-primary mb-4 text-xl font-semibold">{title}</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="text-primary border-border w-full rounded-md border px-3 py-2"
                />
            </div>
            
            <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden border border-gray-200 rounded-sm">
                        <Table className="min-w-full">
                            <TableHeader>
                                <TableRow>
                                    {Object.keys(columns).map((key, index) => (
                                        <TableHead 
                                            key={index} 
                                            className="text-primary whitespace-nowrap px-2 sm:px-4 py-2 text-xs sm:text-sm"
                                        >
                                            {key}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row, rowIndex) => (
                                        <TableRow key={rowIndex} className="border-seperator hover:bg-hover border-b">
                                            {Object.keys(columns).map((key, colIndex) => (
                                                <TableCell 
                                                    key={colIndex} 
                                                    className="text-primary px-2 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                                                >
                                                    {columns[key](row)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={Object.keys(columns).length} 
                                            className="text-primary py-8 text-center text-sm"
                                        >
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <div className="mt-6 mb-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="text-buttontext bg-button hover:bg-buttonhover cursor-pointer rounded-lg px-3 sm:px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
                >
                    Previous
                </button>
                <span className="text-primary text-xs sm:text-sm px-4 py-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="text-buttontext bg-button hover:bg-buttonhover cursor-pointer rounded-lg px-3 sm:px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TableComponent;