# Motivation

Redux naturally doesn't support any async activity, 
only via middlewares of special type.
This requires writing middleware code for each HTTP request or writing async action creators.

This library eliminates the boilerplate.

It allows to run HTTP requests as a dispatching of regular actions.
Then you could check actions if it result of corresponding HTTP request.