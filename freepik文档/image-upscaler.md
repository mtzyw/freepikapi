# Upscale an image with Magnific

> This asynchronous endpoint enables image upscaling using advanced AI algorithms. Upon submission, it returns a unique `task_id` which can be used to track the progress of the upscaling process. For real-time production use, include the optional `webhook_url` parameter to receive an automated notification once the task has been completed. This allows for seamless integration and efficient task management without the need for continuous polling.


## OpenAPI

````yaml post /v1/ai/image-upscaler
paths:
  path: /v1/ai/image-upscaler
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
              image:
                allOf:
                  - description: >
                      Base64 image to upscale

                      The resulted image can't exceed maximum allowed size of
                      25.3 million pixels.
                    format: byte
                    type: string
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
              scale_factor:
                allOf:
                  - default: 2x
                    description: >-
                      Configure scale factor of the image. For higher scales,
                      the image will take longer to process
                    enum:
                      - 2x
                      - 4x
                      - 8x
                      - 16x
                    type: string
              optimized_for:
                allOf:
                  - default: standard
                    description: Styles to optimize the upscale process
                    enum:
                      - standard
                      - soft_portraits
                      - hard_portraits
                      - art_n_illustration
                      - videogame_assets
                      - nature_n_landscapes
                      - films_n_photography
                      - 3d_renders
                      - science_fiction_n_horror
                    type: string
              prompt:
                allOf:
                  - description: >-
                      Prompt to guide the upscale process. Reusing the same
                      prompt for AI-generated images will improve the results
                    type: string
              creativity:
                allOf:
                  - default: 0
                    description: |
                      Increase or decrease AI's creativity.
                      Valid values range `[-10, 10]`, default `0`.
                    maximum: 10
                    minimum: -10
                    type: integer
              hdr:
                allOf:
                  - default: 0
                    description: |
                      Increase or decrease the level of definition and detail.
                      Valid values range `[-10, 10]`, default `0`.
                    maximum: 10
                    minimum: -10
                    type: integer
              resemblance:
                allOf:
                  - default: 0
                    description: |
                      Adjust the level of resemblance to the original image.
                      Valid values range `[-10, 10]`, default `0`.
                    maximum: 10
                    minimum: -10
                    type: integer
              fractality:
                allOf:
                  - default: 0
                    description: >
                      Control the strength of the prompt and intricacy per
                      square pixel.

                      Valid values range `[-10, 10]`, default `0`.
                    maximum: 10
                    minimum: -10
                    type: integer
              engine:
                allOf:
                  - default: automatic
                    description: Magnific model engines
                    enum:
                      - automatic
                      - magnific_illusio
                      - magnific_sharpy
                      - magnific_sparkle
                    type: string
            refIdentifier: '#/components/schemas/image-upscale-request-content'
            requiredProperties:
              - image
        examples:
          all-params:
            summary: Example - Upscaler request with all params
            value:
              image: >-
                iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
              webhook_url: https://httpbin.org/post
              scale_factor: 2x
              optimized_for: standard
              prompt: Crazy dog in the space
              creativity: 2
              hdr: 1
              resemblance: 0
              fractality: -1
              engine: magnific_sparkle
          required-params:
            summary: Request - Image upscaling required params
            value:
              image: >-
                iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              data:
                allOf:
                  - $ref: '#/components/schemas/task-detail'
            refIdentifier: '#/components/schemas/get_style_transfer_task_status_200_response'
            requiredProperties:
              - data
            example:
              data:
                generated:
                  - https://openapi-generator.tech
                  - https://openapi-generator.tech
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
        examples:
          success - in progress task:
            summary: Success - Task in progress
            value:
              data:
                generated: []
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
        description: >-
          OK - The request has succeeded and the upscaling process has started.
          The result will be notified by a Webhook call
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
    task-detail:
      allOf:
        - $ref: '#/components/schemas/task'
        - properties:
            generated:
              items:
                description: URL of the generated image
                format: uri
                type: string
              type: array
          required:
            - generated
          type: object
      example:
        generated:
          - https://openapi-generator.tech
          - https://openapi-generator.tech
        task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
        status: IN_PROGRESS
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