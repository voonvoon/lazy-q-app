// purpose:is redirect the user to the frontend page after the payment is completed.
// The route is called by the payment gateway after the payment is completed --return url
// but this return url is POST method, so we need to create a POST route to handle the request.
// redirect the user to the frontend page after the payment is completed.
// 303 status code indicates that the client should perform a GET request to the new URL instead of original POST.


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Extract the orderId from the query parameters
        const orderId = req.nextUrl.searchParams.get('id');
        
        if (!orderId) {
            return new NextResponse('Bad Request: Missing orderId', { status: 400 });
        }

        // Construct the absolute URL for redirection with the orderId
        const url = new URL(`/order-summary?id=${orderId}`, req.nextUrl.origin);

        // Redirect to the frontend page without passing any data
        return NextResponse.redirect(url.toString(), 303); // The 303 makes client to perform a GET request to the new URL.
    } catch (error) {
        console.error('Error processing request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

