# Style transfer an image using AI

## OpenAPI

````yaml post /v1/ai/image-style-transfer
paths:
  path: /v1/ai/image-style-transfer
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
                  - description: Base64 or URL of the image to do the style transfer
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
              reference_image:
                allOf:
                  - description: Base64 or URL of the reference image for style transfer
                    type: string
              prompt:
                allOf:
                  - description: Prompt for the AI model
                    type: string
              style_strength:
                allOf:
                  - default: 100
                    description: Percentage of style strength
                    maximum: 100
                    minimum: 0
                    type: integer
              structure_strength:
                allOf:
                  - default: 50
                    description: Allows to maintain the structure of the original image
                    maximum: 100
                    minimum: 0
                    type: integer
              is_portrait:
                allOf:
                  - default: false
                    description: >
                      Indicates whether the image should be processed as a
                      portrait. When set to `true`, portrait-specific
                      enhancements such as style and beautification can be
                      applied.
                    type: boolean
              portrait_style:
                allOf:
                  - default: standard
                    description: >
                      Optional setting to define the visual style applied to
                      portrait images. Only used if `is_portrait` is `true`. The
                      available options adjust the stylization level or
                      aesthetic treatment of the portrait.
                    enum:
                      - standard
                      - pop
                      - super_pop
                    type: string
              portrait_beautifier:
                allOf:
                  - description: >
                      Optional setting to enable facial beautification on
                      portrait images. Only used if `is_portrait` is `true`.
                      Options control the intensity or type of beautification
                      applied.
                    enum:
                      - beautify_face
                      - beautify_face_max
                    type: string
              flavor:
                allOf:
                  - default: faithful
                    description: Flavor of the transferring style
                    enum:
                      - faithful
                      - gen_z
                      - psychedelia
                      - detaily
                      - clear
                      - donotstyle
                      - donotstyle_sharp
                    type: string
              engine:
                allOf:
                  - default: balanced
                    enum:
                      - balanced
                      - definio
                      - illusio
                      - 3d_cartoon
                      - colorful_anime
                      - caricature
                      - real
                      - super_real
                      - softy
                    type: string
              fixed_generation:
                allOf:
                  - default: false
                    description: >
                      When this option is enabled, using the same settings will
                      consistently produce the same image.

                      Fixed generations are ideal for fine-tuning, as it allows
                      for incremental changes to parameters (such as the prompt)
                      to see subtle variations in the output.

                      When disabled, expect each generation to introduce a
                      degree of randomness, leading to more diverse outcomes.
                    type: boolean
            required: true
            refIdentifier: '#/components/schemas/style-transfer-request-content'
            requiredProperties:
              - image
              - reference_image
        examples:
          required-params:
            summary: Request - Image Style Transfer required params
            value:
              image: iVBORw0KGgoAAAANSUhEUgAA...
              reference_image: iVBORw0KGgoAAAANSUhEUgAA...
          all-params:
            summary: Request - Image Style Transfer all params
            value:
              image: iVBORw0KGgoAAAANSUhEUgAA...
              reference_image: iVBORw0KGgoAAAANSUhEUgAA...
              webhook_url: https://my-webhook-url.com/endpoint
              prompt: Transform the image into a modern artistic style
              style_strength: 85
              structure_strength: 60
              is_portrait: true
              portrait_style: pop
              portrait_beautifier: beautify_face_max
              flavor: gen_z
              engine: colorful_anime
              fixed_generation: true
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
              task_status:
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
            refIdentifier: '#/components/schemas/apply_style_transfer_to_image_200_response'
            requiredProperties:
              - generated
              - task_id
              - task_status
            example:
              task_status: IN_PROGRESS
              generated:
                - https://openapi-generator.tech
                - https://openapi-generator.tech
              task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
        examples:
          success - in progress task:
            summary: Success - Task in progress
            value:
              data:
                generated: []
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
        description: >-
          OK - The request has succeeded and the Style Transfer process has
          started.
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