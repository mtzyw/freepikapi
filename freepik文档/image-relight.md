# Relight an image

> Relight an image using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/image-relight
paths:
  path: /v1/ai/image-relight
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
                  - description: Base64 or URL of the image to do the relight
                    type: string
              prompt:
                allOf:
                  - description: >
                      You can guide the generation process and influence the
                      light transfer with a descriptive prompt. For example, if
                      the reference image is a brightly lit scene, adding
                      something like "A sunlit forest clearing at golden hour"
                      will be helpful.


                      You can also use your imagination to alter lighting
                      conditions in images: transforming a daytime scene into a
                      moonlit night, enhancing the warmth of a sunset, or even
                      dramatic changes like casting shadows of towering
                      structures across a cityscape.


                      IMPORTANT: You can emphasize specific aspects of the light
                      in your prompt by using a number in parentheses, ranging
                      from 1 to 1.4, like "(dark scene:1.3)".
                    type: string
              transfer_light_from_reference_image:
                allOf:
                  - description: >-
                      Base64 or URL of the reference image for light transfer.
                      Incompatible with 'transfer_light_from_lightmap'
                    type: string
              transfer_light_from_lightmap:
                allOf:
                  - description: >-
                      Base64 or URL of the lightmap for light transfer.
                      Icompatible with 'transfer_light_from_reference_image'
                    type: string
              light_transfer_strength:
                allOf:
                  - default: 100
                    description: >
                      It allows you to specify the level of light transfer,
                      meaning the intensity that your prompt, reference image,
                      or lightmap will have. A value of 0% will keep your image
                      closest to the original, while 100% represents the maximum
                      possible light transfer.


                      If you enable "Interpolate from original", lower values on
                      this slider will make the result even more similar to your
                      original image.

                      Valid values range `[0, 100]`, default `100`
                    maximum: 100
                    minimum: 0
                    type: integer
              interpolate_from_original:
                allOf:
                  - default: false
                    description: >
                      When enabled, this feature will make your final image
                      interpolate from the original using the "Light transfer
                      strength" slider, at the cost of sometimes restricting the
                      generation's freedom.


                      If disabled, the generation will be freer and will
                      generally produce better results. However, for example, if
                      you want to generate all the frames of a video where a
                      room transitions from having the lights off and very dim
                      lighting to gradually becoming fully illuminated as a new
                      day begins, activating this option might be useful
                      (together with gradually ingreasing the "Light transfer
                      strength" slider).
                    type: boolean
              change_background:
                allOf:
                  - default: true
                    description: >
                      When enabled, it will change the background based on your
                      prompt and/or reference image. This is super useful for
                      product placement and portraits. However, don't forget to
                      disable it if your scene is something like a landscape or
                      an interior.
                    type: boolean
              style:
                allOf:
                  - default: standard
                    enum:
                      - standard
                      - darker_but_realistic
                      - clean
                      - smooth
                      - brighter
                      - contrasted_n_hdr
                      - just_composition
                    type: string
              preserve_details:
                allOf:
                  - default: true
                    description: >
                      It will try to maintain the texture and small details of
                      the original image. Especially good for product
                      photography, texts, etc. Disable it if you prefer a
                      smoother result.
                    type: boolean
              advanced_settings:
                allOf:
                  - $ref: '#/components/schemas/relight-request-advanced-settings'
            refIdentifier: '#/components/schemas/relight-request'
            requiredProperties:
              - image
        examples:
          all-params:
            summary: Example - Relight request with all params
            value:
              image: >-
                iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
              prompt: A sunlit forest clearing at golden hour
              transfer_light_from_reference_image: >-
                iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
              light_transfer_strength: 100
              interpolate_from_original: false
              change_background: true
              style: smooth
              advanced_settings:
                whites: 60
                blacks: 60
                brightness: 30
                contrast: 40
                saturation: 50
                engine: illusio
                transfer_light_a: low
                transfer_light_b: soft_in
                fixed_generation: true
          required-params:
            summary: Example - Relight only required params
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
          example:
            value:
              data:
                generated:
                  - https://openapi-generator.tech
                  - https://openapi-generator.tech
                task_id: 046b6c7f-0b8a-43b9-b35d-6489e6daee91
                status: IN_PROGRESS
        description: OK - The request has succeeded and the relight process has started.
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
    relight-request-advanced-settings:
      properties:
        whites:
          default: 50
          description: |
            Adjust the level of white color in the image.
            Valid values range `[0, 100]`, default `50`.
          maximum: 100
          minimum: 0
          type: integer
        blacks:
          default: 50
          description: |
            Adjust the level of black color in the image.
            Valid values range `[0, 100]`, default `50`.
          maximum: 100
          minimum: 0
          type: integer
        brightness:
          default: 50
          description: |
            Adjust the level of brightness in the image.
            Valid values range `[0, 100]`, default `50`.
          maximum: 100
          minimum: 0
          type: integer
        contrast:
          default: 50
          description: |
            Adjust the level of contrast in the image.
            Valid values range `[0, 100]`, default `50`.
          maximum: 100
          minimum: 0
          type: integer
        saturation:
          default: 50
          description: |
            Adjust the level of saturation in the image.
            Valid values range `[0, 100]`, default `50`.
          maximum: 100
          minimum: 0
          type: integer
        engine:
          default: automatic
          description: |
            Balanced: Well-rounded, general-purpose option.
            Cool: Brighter with cooler tones.
            Real: Aims to enhance photographic quality. Experimental.
            Illusio: Optimized for illustrations and drawings.
            Fairy: Suited for fantasy-themed images.
            Colorful Anime: Ideal for anime, cartoons, and vibrant colors.
            Hard Transform: Significantly alters the original image.
            Softy: Slightly softer effect, suitable for graphic designs.
          enum:
            - automatic
            - balanced
            - cool
            - real
            - illusio
            - fairy
            - colorful_anime
            - hard_transform
            - softy
          type: string
        transfer_light_a:
          default: automatic
          description: >-
            Adjusts the intensity of light transfer. Advanced feature requiring
            practice to use effectively.
          enum:
            - automatic
            - low
            - medium
            - normal
            - high
            - high_on_faces
          type: string
        transfer_light_b:
          default: automatic
          description: >-
            Also modifies light transfer intensity. Can be combined with the
            previous control for varied effects. Complex to master but offers
            more control
          enum:
            - automatic
            - composition
            - straight
            - smooth_in
            - smooth_out
            - smooth_both
            - reverse_both
            - soft_in
            - soft_out
            - soft_mid
            - strong_mid
            - style_shift
            - strong_shift
          type: string
        fixed_generation:
          default: false
          description: >
            When this option is enabled, using the same settings will
            consistently produce the same image. Fixed generations are ideal for
            fine-tuning, as it allows for incremental changes to parameters
            (such as the prompt) to see subtle variations in the output. When
            disabled, expect each generation to introduce a degree of
            randomness, leading to more diverse outcomes.
          type: boolean
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