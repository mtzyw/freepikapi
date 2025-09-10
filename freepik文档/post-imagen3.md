# Create image from text - Imagen3

> Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/text-to-image/imagen3
paths:
  path: /v1/ai/text-to-image/imagen3
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
                  - description: The prompt to be used while generating the image
                    example: A beautiful sunset over a calm ocean
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
              num_images:
                allOf:
                  - default: 1
                    description: >
                      Specifies the number of images to generate in a single
                      request.

                      Valid values range `[1, 4]`, default `1`.
                    example: 1
                    maximum: 4
                    minimum: 1
                    type: integer
              aspect_ratio:
                allOf:
                  - default: square_1_1
                    description: The aspect ratio of the image
                    enum:
                      - square_1_1
                      - social_story_9_16
                      - widescreen_16_9
                      - traditional_3_4
                      - classic_4_3
                    example: square_1_1
                    type: string
              styling:
                allOf:
                  - $ref: '#/components/schemas/ttii3_request_content_styling'
              person_generation:
                allOf:
                  - default: allow_all
                    description: Allow person generation
                    enum:
                      - dont_allow
                      - allow_adult
                      - allow_all
                    type: string
              safety_settings:
                allOf:
                  - default: block_none
                    description: Safety settings options
                    enum:
                      - block_low_and_above
                      - block_medium_and_above
                      - block_only_high
                      - block_none
                    type: string
            refIdentifier: '#/components/schemas/ttii3-request-content'
            requiredProperties:
              - prompt
        examples:
          all-params:
            summary: Request - Text to image imagen3 all params
            value:
              prompt: Crazy dog in the space
              num_images: 1
              aspect_ratio: square_1_1
              styling:
                style: anime
                effects:
                  color: pastel
                  lightning: warm
                  framing: portrait
              person_generation: allow_adult
              safety_settings: block_low_and_above
          required-params:
            summary: Request - Text to image required params
            value:
              prompt: Crazy dog in the space
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
        description: OK - The request has succeeded and the Imagen3 process has started.
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
    ttii3_request_content_styling_effects:
      properties:
        color:
          description: The color of the image
          enum:
            - b&w
            - pastel
            - sepia
            - dramatic
            - vibrant
            - orange&teal
            - film-filter
            - split
            - electric
            - pastel-pink
            - gold-glow
            - autumn
            - muted-green
            - deep-teal
            - duotone
            - terracotta&teal
            - red&blue
            - cold-neon
            - burgundy&blue
          example: red
          type: string
        lightning:
          description: The lightning of the image
          enum:
            - studio
            - warm
            - cinematic
            - volumetric
            - golden-hour
            - long-exposure
            - cold
            - iridescent
            - dramatic
            - hardlight
            - redscale
            - indoor-light
          example: warm
          type: string
        framing:
          description: The framing of the image
          enum:
            - portrait
            - macro
            - panoramic
            - aerial-view
            - close-up
            - cinematic
            - high-angle
            - low-angle
            - symmetry
            - fish-eye
            - first-person
          example: portrait
          type: string
      type: object
    ttii3_request_content_styling:
      properties:
        style:
          description: The style of the image
          enum:
            - photo
            - digital-art
            - 3d
            - painting
            - low-poly
            - pixel-art
            - anime
            - cyberpunk
            - comic
            - vintage
            - cartoon
            - vector
            - studio-shot
            - dark
            - sketch
            - mockup
            - 2000s-pone
            - 70s-vibe
            - watercolor
            - art-nouveau
            - origami
            - surreal
            - fantasy
            - traditional-japan
          example: cartoon
          type: string
        effects:
          $ref: '#/components/schemas/ttii3_request_content_styling_effects'
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

````# Create image from text - Imagen3

> Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/text-to-image/imagen3
paths:
  path: /v1/ai/text-to-image/imagen3
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
                  - description: The prompt to be used while generating the image
                    example: A beautiful sunset over a calm ocean
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
              num_images:
                allOf:
                  - default: 1
                    description: >
                      Specifies the number of images to generate in a single
                      request.

                      Valid values range `[1, 4]`, default `1`.
                    example: 1
                    maximum: 4
                    minimum: 1
                    type: integer
              aspect_ratio:
                allOf:
                  - default: square_1_1
                    description: The aspect ratio of the image
                    enum:
                      - square_1_1
                      - social_story_9_16
                      - widescreen_16_9
                      - traditional_3_4
                      - classic_4_3
                    example: square_1_1
                    type: string
              styling:
                allOf:
                  - $ref: '#/components/schemas/ttii3_request_content_styling'
              person_generation:
                allOf:
                  - default: allow_all
                    description: Allow person generation
                    enum:
                      - dont_allow
                      - allow_adult
                      - allow_all
                    type: string
              safety_settings:
                allOf:
                  - default: block_none
                    description: Safety settings options
                    enum:
                      - block_low_and_above
                      - block_medium_and_above
                      - block_only_high
                      - block_none
                    type: string
            refIdentifier: '#/components/schemas/ttii3-request-content'
            requiredProperties:
              - prompt
        examples:
          all-params:
            summary: Request - Text to image imagen3 all params
            value:
              prompt: Crazy dog in the space
              num_images: 1
              aspect_ratio: square_1_1
              styling:
                style: anime
                effects:
                  color: pastel
                  lightning: warm
                  framing: portrait
              person_generation: allow_adult
              safety_settings: block_low_and_above
          required-params:
            summary: Request - Text to image required params
            value:
              prompt: Crazy dog in the space
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
        description: OK - The request has succeeded and the Imagen3 process has started.
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
    ttii3_request_content_styling_effects:
      properties:
        color:
          description: The color of the image
          enum:
            - b&w
            - pastel
            - sepia
            - dramatic
            - vibrant
            - orange&teal
            - film-filter
            - split
            - electric
            - pastel-pink
            - gold-glow
            - autumn
            - muted-green
            - deep-teal
            - duotone
            - terracotta&teal
            - red&blue
            - cold-neon
            - burgundy&blue
          example: red
          type: string
        lightning:
          description: The lightning of the image
          enum:
            - studio
            - warm
            - cinematic
            - volumetric
            - golden-hour
            - long-exposure
            - cold
            - iridescent
            - dramatic
            - hardlight
            - redscale
            - indoor-light
          example: warm
          type: string
        framing:
          description: The framing of the image
          enum:
            - portrait
            - macro
            - panoramic
            - aerial-view
            - close-up
            - cinematic
            - high-angle
            - low-angle
            - symmetry
            - fish-eye
            - first-person
          example: portrait
          type: string
      type: object
    ttii3_request_content_styling:
      properties:
        style:
          description: The style of the image
          enum:
            - photo
            - digital-art
            - 3d
            - painting
            - low-poly
            - pixel-art
            - anime
            - cyberpunk
            - comic
            - vintage
            - cartoon
            - vector
            - studio-shot
            - dark
            - sketch
            - mockup
            - 2000s-pone
            - 70s-vibe
            - watercolor
            - art-nouveau
            - origami
            - surreal
            - fantasy
            - traditional-japan
          example: cartoon
          type: string
        effects:
          $ref: '#/components/schemas/ttii3_request_content_styling_effects'
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

````# Create image from text - Imagen3

> Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/text-to-image/imagen3
paths:
  path: /v1/ai/text-to-image/imagen3
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
                  - description: The prompt to be used while generating the image
                    example: A beautiful sunset over a calm ocean
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
              num_images:
                allOf:
                  - default: 1
                    description: >
                      Specifies the number of images to generate in a single
                      request.

                      Valid values range `[1, 4]`, default `1`.
                    example: 1
                    maximum: 4
                    minimum: 1
                    type: integer
              aspect_ratio:
                allOf:
                  - default: square_1_1
                    description: The aspect ratio of the image
                    enum:
                      - square_1_1
                      - social_story_9_16
                      - widescreen_16_9
                      - traditional_3_4
                      - classic_4_3
                    example: square_1_1
                    type: string
              styling:
                allOf:
                  - $ref: '#/components/schemas/ttii3_request_content_styling'
              person_generation:
                allOf:
                  - default: allow_all
                    description: Allow person generation
                    enum:
                      - dont_allow
                      - allow_adult
                      - allow_all
                    type: string
              safety_settings:
                allOf:
                  - default: block_none
                    description: Safety settings options
                    enum:
                      - block_low_and_above
                      - block_medium_and_above
                      - block_only_high
                      - block_none
                    type: string
            refIdentifier: '#/components/schemas/ttii3-request-content'
            requiredProperties:
              - prompt
        examples:
          all-params:
            summary: Request - Text to image imagen3 all params
            value:
              prompt: Crazy dog in the space
              num_images: 1
              aspect_ratio: square_1_1
              styling:
                style: anime
                effects:
                  color: pastel
                  lightning: warm
                  framing: portrait
              person_generation: allow_adult
              safety_settings: block_low_and_above
          required-params:
            summary: Request - Text to image required params
            value:
              prompt: Crazy dog in the space
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
        description: OK - The request has succeeded and the Imagen3 process has started.
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
    ttii3_request_content_styling_effects:
      properties:
        color:
          description: The color of the image
          enum:
            - b&w
            - pastel
            - sepia
            - dramatic
            - vibrant
            - orange&teal
            - film-filter
            - split
            - electric
            - pastel-pink
            - gold-glow
            - autumn
            - muted-green
            - deep-teal
            - duotone
            - terracotta&teal
            - red&blue
            - cold-neon
            - burgundy&blue
          example: red
          type: string
        lightning:
          description: The lightning of the image
          enum:
            - studio
            - warm
            - cinematic
            - volumetric
            - golden-hour
            - long-exposure
            - cold
            - iridescent
            - dramatic
            - hardlight
            - redscale
            - indoor-light
          example: warm
          type: string
        framing:
          description: The framing of the image
          enum:
            - portrait
            - macro
            - panoramic
            - aerial-view
            - close-up
            - cinematic
            - high-angle
            - low-angle
            - symmetry
            - fish-eye
            - first-person
          example: portrait
          type: string
      type: object
    ttii3_request_content_styling:
      properties:
        style:
          description: The style of the image
          enum:
            - photo
            - digital-art
            - 3d
            - painting
            - low-poly
            - pixel-art
            - anime
            - cyberpunk
            - comic
            - vintage
            - cartoon
            - vector
            - studio-shot
            - dark
            - sketch
            - mockup
            - 2000s-pone
            - 70s-vibe
            - watercolor
            - art-nouveau
            - origami
            - surreal
            - fantasy
            - traditional-japan
          example: cartoon
          type: string
        effects:
          $ref: '#/components/schemas/ttii3_request_content_styling_effects'
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