# Image expand using AI Flux Pro

> This endpoint allows you to expand an image using the AI Flux Pro model. The image will be expanded based on the provided parameters.


## OpenAPI

````yaml post /v1/ai/image-expand/flux-pro
paths:
  path: /v1/ai/image-expand/flux-pro
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
                  - description: Base64 image to expand
                    format: byte
                    type: string
              prompt:
                allOf:
                  - description: >-
                      The description of the changes you want to make. This text
                      guides the expansion process, allowing you to specify
                      features, styles, or modifications for the expanded areas.
                    type: string
              left:
                allOf:
                  - description: Pixel to expand on the left
                    maximum: 2048
                    minimum: 0
                    nullable: true
                    type: integer
              right:
                allOf:
                  - description: Pixel to expand on the right
                    maximum: 2048
                    minimum: 0
                    nullable: true
                    type: integer
              top:
                allOf:
                  - description: Pixel to expand on the top
                    maximum: 2048
                    minimum: 0
                    nullable: true
                    type: integer
              bottom:
                allOf:
                  - description: Pixel to expand on the bottom
                    maximum: 2048
                    minimum: 0
                    nullable: true
                    type: integer
            required: true
            refIdentifier: '#/components/schemas/image-expand-request'
            requiredProperties:
              - image
        examples:
          example:
            value:
              webhook_url: https://www.example.com/webhook
              image: aSDinaTvuI8gbWludGxpZnk=
              prompt: <string>
              left: 1024
              right: 1024
              top: 1024
              bottom: 1024
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              data:
                allOf:
                  - $ref: '#/components/schemas/task-detail_1'
            refIdentifier: >-
              #/components/schemas/_v1_ai_text_to_image_hyperflux_post_200_response
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
          success - created task:
            summary: Success - Task created
            value:
              data:
                generated: []
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: CREATED
          success - in progress task:
            summary: Success - Task in progress
            value:
              data:
                generated: []
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
          success - completed task:
            summary: Success - Task completed
            value:
              data:
                generated:
                  - https://ai-statics.freepik.com/completed_task_image.jpg
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: COMPLETED
          success - failed task:
            summary: Success - Task failed
            value:
              data:
                generated: []
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: FAILED
        description: OK - The task exists and the status is returned
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
    task-detail_1:
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