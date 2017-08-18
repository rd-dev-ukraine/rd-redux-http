# Motivation

Typescript-powered library for making HTTP requests integrated with redux.

* Configure HTTP requests with fluent interface and use it for running request or dispatching an action
* Process successfull and error responses and status codes without writing boilerplate code
* Creates actions for running HTTP request and automatically dispatches actions for successfull and error results
* Provides a set of type guards for checking action types


# Using without redux

Perform GET request with parameters:

``` typescript
// Typescript
import { http } from "rd-redux-http";

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

const getPostByIdRequest = http.get<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
            .resultFromJson<Post>()
            .build();

getPostByIdRequest({ postId: 1})
    .then(response => {
        if (response.ok) {
            console.log(response.result); // Data of Post with id=1 
        } else {
            // Process error here
        }
    });

```

Perform POST request with body: 

``` typescript
import { http } from "rd-redux-http";

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

interface PostValidationError {
    [field: string]: string;
}

 const createPostRequest = http.put<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
            .jsonBody<Post>()
            .resultFromJson<Post, PostValidationError>() // Error type is optional
            .build();

 createPost({ postId: 1 }, {
        id: 1,
        title: "test",
        body: "body",
        userId: 1
    })
    .then(response => {
        if (response.ok) {
            // Process correct response here
        } else {
            if (response.errorType === "response") {
                // Server responsed with status 400 Bad request and sent validation errors in body
                console.log(response.error["title"]);
            }
        }
    });

```

# Using with redux

``` typescript

import { http } from "rd-redux-http";
import { reduxHttpMiddleware } from "rd-redux-http/redux";
import { applyMiddleware, compose, createStore } from "redux";


// Create middleware instance
const mw = reduxHttpMiddleware();

// Use it on store
const store = createStore(
    compose(
        applyMiddleware(
            mw
        )
    )
);

// Now createPostRequest has extra methods for creating actions 
// and checking if action is belongs to this request
const createPostRequest = mw.register(
    http.put<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
            .jsonBody<Post>()
            .resultFromJson<Post, PostValidationError>() // Error type is optional
            .build()
);


store.dispatch(
    createPostRequest.run({ postId: 1}, {
            id: 1,
            userId: 1,
            title: "title",
            body: "body"
    })
);

// create-post-reducer.ts

function createPostReducer(state: CreatePostRequestState, action: Action): CreatePostRequestState {
    if (createPostRequest.isRunning(action)) {
        return {
            ...state,
            isLoading: true,
            error: undefined
        };
    }

    if (createPostRequest.isOk(action)) {
        // Thanks for type narrowing,
        // now action.result: Post

        return {
            data: action.result,
            isLoading: false,
            error: undefined,
            message: `Post with ID ${action.result.id} created` // Also action.parameters.id is available
        };
    }

    
    if (createPostRequest.isError(action)) {
        // Validation error, server responded with 400 status code and error details in body.
        if (createPostRequest.isErrorResponse(action)) {
            return {
                ...state,
                isLoading: false,
                error: action.error, // Narrowed to PostValidationError
                message: "Error occured due creating a post"
            };
        } else { // Server responded with other error or connection problems
            return {
                ...state,
                isLoading: false,
                error: "An error occured due creating a post"
            };
        }
    }
}


```