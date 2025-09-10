# Create image from text - Flux dev

> Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/text-to-image/flux-dev
paths:
  path: /v1/ai/text-to-image/flux-dev
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
                  - description: >
                      The prompt is a short text that describes the image you
                      want to generate. It can range from simple descriptions,
                      like `"a cat"`, to detailed scenarios, such as `"a cat
                      with wings, playing the guitar, and wearing a hat"`. If no
                      prompt is provided, the AI will generate a random image.
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
              aspect_ratio:
                allOf:
                  - default: square_1_1
                    description: >
                      Image size with the aspect ratio. The aspect ratio is the
                      proportional relationship between an image's width and
                      height, expressed as *_width_height (e.g., square_1_1,
                      widescreen_16_9). It is calculated by dividing the width
                      by the height.\

                      If not present, the default is `square_1_1`.
                    enum:
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
                    example: square_1_1
                    type: string
              styling:
                allOf:
                  - $ref: '#/components/schemas/ttifd_request_content_styling'
              seed:
                allOf:
                  - description: >-
                      Seed for the image generation. If not provided, a random
                      seed will be used.
                    maximum: 4294967295
                    minimum: 1
                    type: integer
            required: true
            refIdentifier: '#/components/schemas/ttifd-request-content'
        examples:
          example:
            value:
              prompt: <string>
              webhook_url: https://www.example.com/webhook
              aspect_ratio: square_1_1
              styling:
                effects:
                  color: softhue
                  framing: portrait
                  lightning: iridescent
                colors:
                  - color: '#FF0000'
                    weight: 0.5
              seed: 2147483648
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
        description: OK - Get the status of the flux-dev task
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
    ttifd_request_content_styling_effects:
      properties:
        color:
          description: Color effect to apply
          enum:
            - softhue
            - b&w
            - goldglow
            - vibrant
            - coldneon
          type: string
        framing:
          description: Camera effect to apply
          enum:
            - portrait
            - lowangle
            - midshot
            - wideshot
            - tiltshot
            - aerial
          type: string
        lightning:
          description: Lightning effect to apply
          enum:
            - iridescent
            - dramatic
            - goldenhour
            - longexposure
            - indorlight
            - flash
            - neon
          type: string
      type: object
    ttifd_request_content_styling:
      description: Styling options for the image
      properties:
        effects:
          $ref: '#/components/schemas/ttifd_request_content_styling_effects'
        colors:
          description: Dominant colors to generate the image
          items:
            $ref: '#/components/schemas/colors_palette_inner'
          maxItems: 5
          minItems: 1
          type: array
      type: object
    colors_palette_inner:
      properties:
        color:
          description: Hex color code
          example: '#FF0000'
          pattern: ^#[0-9A-F]{6}$
          type: string
        weight:
          description: Weight of the color (0.05 to 1)
          example: 0.5
          maximum: 1
          minimum: 0.05
          type: number
      required:
        - color
        - weight
      type: object

````