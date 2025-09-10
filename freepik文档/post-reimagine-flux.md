# (Beta) Reimagine Flux

> (Beta, synchronous) Reimagine Flux is a new AI model that allows you to generate images from text prompts.

## OpenAPI

````yaml post /v1/ai/beta/text-to-image/reimagine-flux
paths:
  path: /v1/ai/beta/text-to-image/reimagine-flux
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
              prompt:
                allOf:
                  - example: A beautiful sunset over a calm ocean
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
              image:
                allOf:
                  - description: Base64 image to do the reimagination
                    format: byte
                    type: string
              imagination:
                allOf:
                  - description: Imagination type
                    enum:
                      - wild
                      - subtle
                      - vivid
                    type: string
              aspect_ratio:
                allOf:
                  - default: original
                    description: >
                      Image size with the aspect ratio. The aspect ratio is the
                      proportional relationship between an image's width and
                      height, expressed as *_width_height (e.g., square_1_1,
                      widescreen_16_9). It is calculated by dividing the width
                      by the height.\

                      If not present, the default is `original`.
                    enum:
                      - original
                      - square_1_1
                      - classic_4_3
                      - traditional_3_4
                      - widescreen_16_9
                      - social_story_9_16
                      - standard_3_2
                      - portrait_2_3
                      - horizontal_2_1
                      - vertical_1_2
                      - social_post_4_5
                    type: string
            refIdentifier: '#/components/schemas/reimagine-flux-request'
            requiredProperties:
              - image
        examples:
          all-params:
            summary: Request - Reimagine Flux all params
            value:
              webhook_url: https://api.ejemplo.com/webhook
              image: iVBORw0KGgoAAAANSUhEUgAA...
              prompt: Un hermoso atardecer sobre un océano tranquilo
              imagination: wild
              aspect_ratio: square_1_1
          required-params:
            summary: Request - Reimagine Flux required params
            value:
              image: iVBORw0KGgoAAAANSUhEUgAA...
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              task_id:
                allOf:
                  - description: Task identifier
                    format: uuid
                    type: string
              status:
                allOf:
                  - description: Task status
                    enum:
                      - IN_PROGRESS
                      - COMPLETED
                      - FAILED
                    type: string
              generated:
                allOf:
                  - items:
                      description: URL of the generated image
                      format: uri
                      type: string
                    type: array
            refIdentifier: '#/components/schemas/task'
            requiredProperties:
              - status
              - task_id
              - generated
            example:
              generated:
                - https://openapi-generator.tech
                - https://openapi-generator.tech
              task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
              status: IN_PROGRESS
        examples:
          success - completed task:
            summary: Success - Task completed
            value:
              data:
                generated:
                  - https://ai-statics.freepik.com/completed_task_image.jpg
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: COMPLETED
        description: Success - The image has been generated
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