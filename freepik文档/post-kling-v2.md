# Create a video from an image using the Kling v2 model

> Create a video from an image using the Kling v2 model

## OpenAPI

````yaml post /v1/ai/image-to-video/kling-v2
paths:
  path: /v1/ai/image-to-video/kling-v2
  method: post
  servers:
    - url: https://api.freepik.com
      description: B2B API Production V1
  request:
    security:
      - title: apiKey
        parameters:
          query: {}
          header:
            x-freepik-api-key:
              type: apiKey
              description: >
                Your Freepik API key. Required for authentication. [Learn how to
                obtain an API
                key](https://docs.freepik.com/authentication#obtaining-an-api-key)
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              webhook_url:
                allOf:
                  - description: >
                      Optional callback URL that will receive asynchronous
                      notifications whenever the task changes status. The
                      payload sent to this URL is the same as the corresponding
                      GET endpoint response, but without the data field.
                    example: https://www.example.com/webhook
                    format: uri
                    type: string
              image:
                allOf:
                  - description: >-
                      Reference Image. Supports Base64 encoding or URL (ensure
                      accessibility). For URL, must be publicly accessible. The
                      image file size cannot exceed 10MB, and the resolution
                      should not be less than 300x300px. Aspect ratio should be
                      between 1:2.5 ~ 2.5:1.
                    example: >-
                      https://img.freepik.com/free-photo/closeup-vertical-shot-cute-european-shorthair-cat_181624-34587.jpg?t=st=1746439555~exp=1746443155~hmac=a7507c7d4a48a81b22bf222d1e0f1808043c9113ef8aac31a595c9128914e8ed&w=740
                    type: string
              prompt:
                allOf:
                  - description: >-
                      Text prompt describing the desired motion, cannot exceed
                      2500 characters
                    example: A cat moving his head
                    type: string
              negative_prompt:
                allOf:
                  - description: >-
                      Text prompt describing what to avoid in the generated
                      video, cannot exceed 2500 characters
                    example: Blurred or poor quality images
                    type: string
              duration:
                allOf:
                  - description: Duration of the generated video in seconds
                    enum:
                      - '5'
                      - '10'
                    example: '5'
                    type: string
              cfg_scale:
                allOf:
                  - default: 0.5
                    description: >-
                      Flexibility in video generation; The higher the value, the
                      lower the model's degree of flexibility, and the stronger
                      the relevance to the user's prompt.
                    format: float
                    maximum: 1
                    minimum: 0
                    type: number
            required: true
            refIdentifier: '#/components/schemas/itvkv2-request-content'
            requiredProperties:
              - duration
              - image
        examples:
          required-params:
            summary: Request - Generate video from image with required parameters
            value:
              image: >-
                https://storage.googleapis.com/fc-freepik-pro-rev1-eu-static/landing-api/examples/freepik__upload__53227.png
              duration: '5'
          all-params:
            summary: Request - Generate video from image
            value:
              image: >-
                https://storage.googleapis.com/fc-freepik-pro-rev1-eu-static/landing-api/examples/freepik__upload__53227.png
              prompt: >-
                Close-up shot: A girl opens her clear light blue eyes and smiles
                warmly. The camera gently zooms in, capturing the sparkle in her
                eyes in slow motion, creating an intimate and uplifting
                atmosphere.
              negative_prompt: Blurred or poor quality images
              duration: '5'
              cfg_scale: 0.7
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              data:
                allOf:
                  - $ref: '#/components/schemas/task'
            refIdentifier: '#/components/schemas/create_image_from_text_flux_200_response'
            requiredProperties:
              - data
            example:
              data:
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
        examples:
          example:
            value:
              data:
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
        description: OK - Get the status of the kling-v2 task
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              message:
                allOf:
                  - &ref_0
                    type: string
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_400_response'
            example: &ref_1
              message: message
        examples:
          invalid_page:
            summary: Parameter 'page' is not valid
            value:
              message: Parameter 'page' must be greater than 0
          invalid_query:
            summary: Parameter 'query' is not valid
            value:
              message: Parameter 'query' must not be empty
          invalid_filter:
            summary: Parameter 'filter' is not valid
            value:
              message: Parameter 'filter' is not valid
          generic_bad_request:
            summary: Bad Request
            value:
              message: Parameter ':attribute' is not valid
        description: >-
          Bad Request - The server could not understand the request due to
          invalid syntax.
      application/problem+json:
        schemaArray:
          - type: object
            properties:
              problem:
                allOf:
                  - $ref: >-
                      #/components/schemas/get_all_style_transfer_tasks_400_response_1_problem
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_400_response_1'
        examples:
          invalid_page:
            summary: Parameter 'page' is not valid
            value:
              message: Your request parameters didn't validate.
              invalid_params:
                - name: page
                  reason: Parameter 'page' must be greater than 0
                - name: per_page
                  reason: Parameter 'per_page' must be greater than 0
        description: >-
          Bad Request - The server could not understand the request due to
          invalid syntax.
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              message:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_400_response'
            example: *ref_1
        examples:
          invalid_api_key:
            summary: API key is not valid
            value:
              message: Invalid API key
          missing_api_key:
            summary: API key is not provided
            value:
              message: Missing API key
        description: >-
          Unauthorized - The client must authenticate itself to get the
          requested response.
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              message:
                allOf:
                  - example: Internal Server Error
                    type: string
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_500_response'
            example:
              message: Internal Server Error
        examples:
          example:
            value:
              message: Internal Server Error
        description: >-
          Internal Server Error - The server has encountered a situation it
          doesn't know how to handle.
    '503':
      application/json:
        schemaArray:
          - type: object
            properties:
              message:
                allOf:
                  - example: Service Unavailable. Please try again later.
                    type: string
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_503_response'
            example:
              message: Service Unavailable. Please try again later.
        examples:
          example:
            value:
              message: Service Unavailable. Please try again later.
        description: Service Unavailable
  deprecated: false
  type: path
components:
  schemas:
    task:
      example:
        task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
        status: IN_PROGRESS
      properties:
        task_id:
          description: Task identifier
          format: uuid
          type: string
        status:
          description: Task status
          enum:
            - IN_PROGRESS
            - COMPLETED
            - FAILED
          type: string
      required:
        - status
        - task_id
      type: object
    get_all_style_transfer_tasks_400_response_1_problem_invalid_params_inner:
      properties:
        name:
          example: page
          type: string
        reason:
          example: Parameter 'page' must be greater than 0
          type: string
      required:
        - name
        - reason
      type: object
    get_all_style_transfer_tasks_400_response_1_problem:
      properties:
        message:
          example: Your request parameters didn't validate.
          type: string
        invalid_params:
          items:
            $ref: >-
              #/components/schemas/get_all_style_transfer_tasks_400_response_1_problem_invalid_params_inner
          type: array
      required:
        - invalid_params
        - message
      type: object

````