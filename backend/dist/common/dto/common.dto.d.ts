export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    constructor(data: T[], total: number, page: number, limit: number);
}
export declare class IdParamDto {
    id: string;
}
export declare class ApiResponseDto<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
    timestamp: string;
    constructor(success: boolean, message: string, data?: T, errors?: any);
    static success<T>(data: T, message?: string): ApiResponseDto<T>;
    static error(message: string, errors?: any): ApiResponseDto;
}
export declare class DateRangeDto {
    startDate?: string;
    endDate?: string;
}
