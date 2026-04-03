import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    errors?: unknown[];
    meta?: Record<string, unknown>;
}

export function successResponse<T>(
    data: T,
    message = 'Success',
    status = 200,
    meta?: Record<string, unknown>
): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, message, data, ...(meta ? { meta } : {}) }, { status });
}

export function createdResponse<T>(data: T, message = 'Created successfully'): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, message, data }, { status: 201 });
}

export function errorResponse(
    message: string,
    status = 400,
    errors?: unknown[]
): NextResponse<ApiResponse> {
    return NextResponse.json(
        { success: false, message, ...(errors ? { errors } : {}) },
        { status }
    );
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden: insufficient permissions'): NextResponse<ApiResponse> {
    return errorResponse(message, 403);
}

export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiResponse> {
    return errorResponse(message, 404);
}

export function validationErrorResponse(errors: unknown[]): NextResponse<ApiResponse> {
    return NextResponse.json(
        { success: false, message: 'Validation failed', errors },
        { status: 400 }
    );
}
