# Create a video from text/image - MiniMax Hailuo-02 768p

> Generate a video from text or image using the MiniMax Hailuo-02 768p model.

## OpenAPI

````yaml post /v1/ai/image-to-video/minimax-hailuo-02-768p
paths:
  path: /v1/ai/image-to-video/minimax-hailuo-02-768p
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
                  - &ref_0
                    description: >
                      Optional callback URL that will receive asynchronous
                      notifications whenever the task changes status. The
                      payload sent to this URL is the same as the corresponding
                      GET endpoint response, but without the data field.
                    example: https://www.example.com/webhook
                    format: uri
                    type: string
              prompt:
                allOf:
                  - &ref_1
                    description: >-
                      Description of the video. Note: It should be less than
                      2000 characters.
                    example: >-
                      A beautiful sunset over the mountains with birds flying in
                      the sky
                    maxLength: 2000
                    type: string
              prompt_optimizer:
                allOf:
                  - &ref_2
                    default: true
                    description: >-
                      Whether to use the prompt optimizer. If true, the model
                      will automatically optimize the incoming prompt to improve
                      the generation quality.
                    type: boolean
              first_frame_image:
                allOf:
                  - description: >-
                      The model will use the image passed in this parameter as
                      the first frame to generate a video. Supported formats:
                      URL of the image or base64 encoding of the image. Image
                      specifications: format must be JPG, JPEG, or PNG; aspect
                      ratio should be greater than 2:5 and less than 5:2; the
                      shorter side must exceed 300 pixels; file size must not
                      exceed 20MB.
                    example: >-
                      https://img.freepik.com/free-photo/beautiful-sunset-over-mountains_123456-7890.jpg
                    type: string
              duration:
                allOf:
                  - default: 6
                    description: Video length in seconds
                    enum:
                      - 6
                      - 10
                    example: 6
                    type: integer
            required: true
            title: Image to Video
            refIdentifier: '#/components/schemas/minimax-hailuo-02-base'
            requiredProperties:
              - prompt
              - first_frame_image
          - type: object
            properties:
              webhook_url:
                allOf:
                  - *ref_0
              prompt:
                allOf:
                  - *ref_1
              prompt_optimizer:
                allOf:
                  - *ref_2
              duration:
                allOf:
                  - default: 6
                    description: Video length in seconds
                    enum:
                      - 6
                      - 10
                    example: 6
                    type: integer
            required: true
            title: Text to Video
            refIdentifier: '#/components/schemas/minimax-hailuo-02-base'
            requiredProperties:
              - prompt
        examples:
          example:
            value:
              webhook_url: https://www.example.com/webhook
              prompt: >-
                A beautiful sunset over the mountains with birds flying in the
                sky
              prompt_optimizer: true
              first_frame_image: >-
                https://img.freepik.com/free-photo/beautiful-sunset-over-mountains_123456-7890.jpg
              duration: 6
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
        description: OK - Task created successfully
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              message:
                allOf:
                  - &ref_3
                    type: string
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_400_response'
            example: &ref_4
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
                  - *ref_3
            refIdentifier: '#/components/schemas/get_all_style_transfer_tasks_400_response'
            example: *ref_4
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