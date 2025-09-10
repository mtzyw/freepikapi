# Create a video from image - Seedance Pro 720p

> Generate a video from image using the Seedance Pro 720p model.

## OpenAPI

````yaml post /v1/ai/image-to-video/seedance-pro-720p
paths:
  path: /v1/ai/image-to-video/seedance-pro-720p
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
                      The image to use for the video generation. Supported
                      formats: URL of the image or base64 encoding of the image.
                    example: >-
                      https://img.freepik.com/free-photo/beautiful-girl-dancing_123456-7890.jpg
                    type: string
              prompt:
                allOf:
                  - description: >-
                      The text content used for the video generation. This is
                      the main description of the video to be generated.
                    example: >-
                      A beautiful girl opens her eyes and smiles warmly, the
                      camera gently zooms in capturing the sparkle in her eyes,
                      soft natural lighting
                    maxLength: 2000
                    type: string
              duration:
                allOf:
                  - default: '5'
                    description: Video duration in seconds
                    enum:
                      - '5'
                      - '10'
                    example: '5'
                    type: string
              camera_fixed:
                allOf:
                  - default: false
                    description: Whether the camera position should be fixed
                    example: false
                    type: boolean
              aspect_ratio:
                allOf:
                  - $ref: '#/components/schemas/seedance-aspect-ratio'
              frames_per_second:
                allOf:
                  - default: 24
                    description: Frames per second for the video
                    enum:
                      - 24
                    example: 24
                    type: integer
              seed:
                allOf:
                  - default: -1
                    description: Random seed for video generation. Use -1 for random seed.
                    example: 69
                    maximum: 4294967295
                    minimum: -1
                    type: integer
            required: true
            title: Image to Video - Seedance Pro 720p
            refIdentifier: '#/components/schemas/seedance-base'
            requiredProperties:
              - prompt
        examples:
          example:
            value:
              webhook_url: https://www.example.com/webhook
              image: >-
                https://img.freepik.com/free-photo/beautiful-girl-dancing_123456-7890.jpg
              prompt: >-
                A beautiful girl opens her eyes and smiles warmly, the camera
                gently zooms in capturing the sparkle in her eyes, soft natural
                lighting
              duration: '5'
              camera_fixed: false
              aspect_ratio: widescreen_16_9
              frames_per_second: 24
              seed: 69
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
    seedance-aspect-ratio:
      default: widescreen_16_9
      description: >-
        Video aspect ratio. `(If image is provided, the aspect ratio will be
        automatically detected from the image.)`
      enum:
        - film_horizontal_21_9
        - widescreen_16_9
        - classic_4_3
        - square_1_1
        - traditional_3_4
        - social_story_9_16
        - film_vertical_9_21
      example: widescreen_16_9
      type: string
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