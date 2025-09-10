# Create image from text - Classic fast

> Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/text-to-image
paths:
  path: /v1/ai/text-to-image
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
                  - description: |
                      Text to generate image from
                      Minimum length: `3 characters`
                    example: Crazy dog flying over the space
                    minLength: 3
                    type: string
              negative_prompt:
                allOf:
                  - description: |
                      Attributes to avoid in the generated image
                      Minimum length: `3 characters`
                    example: b&w, grayscale, disfigured, bad quality
                    minLength: 3
                    type: string
              styling:
                allOf:
                  - $ref: '#/components/schemas/request_content_styling'
              guidance_scale:
                allOf:
                  - default: 1
                    description: >
                      Defines the level of fidelity to the prompt when
                      generating the image. A lower value allows for more
                      creativity from the AI, while a higher value ensures
                      closer adherence to the prompt.

                      Valid values range `[0.0, 2.0]`, default `1.0`.
                    example: 2
                    maximum: 2
                    minimum: 0
                    type: number
              image:
                allOf:
                  - $ref: '#/components/schemas/image_size'
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
              seed:
                allOf:
                  - description: >
                      Seed value for image generation. Using the same seed will
                      produce the same image. If omitted, random seed will be
                      applied, resulting in a different image each time.

                      Valid values range `[0, 1000000]`.
                    example: 123
                    maximum: 1000000
                    minimum: 0
                    type: integer
              filter_nsfw:
                allOf:
                  - description: >
                      If true, the generated image will be filtered for NSFW
                      content. If false, the image may contain NSFW content.

                      Default value is `true`.
                    example: true
                    type: boolean
            refIdentifier: '#/components/schemas/request-content'
            requiredProperties:
              - prompt
        examples:
          all-params:
            summary: Request - Text to image all params
            value:
              prompt: Crazy dog in the space
              negative_prompt: b&w, earth, cartoon, ugly
              guidance_scale: 2
              seed: 42
              num_images: 1
              image:
                size: square_1_1
              styling:
                style: anime
                effects:
                  color: pastel
                  lightning: warm
                  framing: portrait
                colors:
                  - color: '#FF5733'
                    weight: 1
                  - color: '#33FF57'
                    weight: 1
              filter_nsfw: true
          required-params:
            summary: Request - Text to image required params
            value:
              prompt: Crazy dog in the space
          portrait-image-size:
            summary: Request - Generate image using one of the fixed sizes
            value:
              prompt: Crazy dog in the space
              image:
                size: portrait_2_3
          styling-params:
            summary: Request - Generate image with custom styling
            value:
              prompt: Crazy dog in the space
              styling:
                style: anime
                effects:
                  color: pastel
                  lightning: warm
                  framing: portrait
                colors:
                  - color: '#FF5733'
                    weight: 1
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              data:
                allOf:
                  - items:
                      $ref: '#/components/schemas/image'
                    type: array
              meta:
                allOf:
                  - $ref: '#/components/schemas/meta'
            refIdentifier: '#/components/schemas/create_image_from_text_classic_200_response'
            requiredProperties:
              - data
              - meta
            example:
              data:
                - base64: >-
                    iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
                  has_nsfw: false
                - base64: >-
                    iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
                  has_nsfw: false
              meta:
                image:
                  size: square_1_1
                  width: 1024
                  height: 1024
                seed: 42
                guidance_scale: 2
                prompt: Crazy dog flying over the space
                num_inference_steps: 8
        examples:
          example:
            value:
              data:
                - base64: >-
                    iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
                  has_nsfw: false
                - base64: >-
                    iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
                  has_nsfw: false
              meta:
                image:
                  size: square_1_1
                  width: 1024
                  height: 1024
                seed: 42
                guidance_scale: 2
                prompt: Crazy dog flying over the space
                num_inference_steps: 8
        description: >-
          OK - The request has succeeded, and the images generated from the text
          are returned.
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
    image_size:
      properties:
        size:
          $ref: '#/components/schemas/aspect_ratio'
      required:
        - size
      type: object
    image:
      example:
        base64: >-
          iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
        has_nsfw: false
      properties:
        base64:
          description: Base64 encoded image
          example: >-
            iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...
          format: base64
          type: string
        has_nsfw:
          description: True if the image has No Safe For Work content, false otherwise
          example: false
          type: boolean
      required:
        - base64
        - has_nsfw
      type: object
    meta:
      example:
        image:
          size: square_1_1
          width: 1024
          height: 1024
        seed: 42
        guidance_scale: 2
        prompt: Crazy dog flying over the space
        num_inference_steps: 8
      properties:
        prompt:
          description: Prompt given to generate the image
          example: Crazy dog flying over the space
          type: string
        seed:
          description: >
            The seed value used to generate the image. Providing the same seed
            will result in the same image being

            generated. If omitted, random seed will be applied, producing a
            different image each time.

            Valid values range `[0, 1000000]`.
          example: 42
          maximum: 1000000
          minimum: 0
          type: integer
        num_inference_steps:
          default: 8
          description: >
            Number of inference steps, higher values will generate more
            realistic images but will take longer to generate.

            Valid values range `[1, 8]`, default `8`
          example: 8
          maximum: 8
          minimum: 1
          type: integer
        guidance_scale:
          default: 1
          description: >
            Defines the level of fidelity to the prompt we give to the image,
            the lower the level, the greater the creativity of the AI.

            Valid values range `[0.0, 2.0]`, default `1.0`
          example: 2
          maximum: 2
          minimum: 0
          type: number
        image:
          $ref: '#/components/schemas/meta_image'
      required:
        - guidance_scale
        - image
        - prompt
        - seed
      type: object
    aspect_ratio:
      default: square_1_1
      description: >
        Image size with the aspect ratio. The aspect ratio is the proportional
        relationship between an image's width and height, expressed as
        *_width_height (e.g., square_1_1, widescreen_16_9). It is calculated by
        dividing the width by the height.\

        If not present, the default is `square_1_1`.

        Note: For the `fluid` model, only this values are valid:

        * square_1_1

        * social_story_9_16

        * widescreen_16_9

        * traditional_3_4

        * classic_4_3
      enum:
        - square_1_1
        - classic_4_3
        - traditional_3_4
        - widescreen_16_9
        - social_story_9_16
        - smartphone_horizontal_20_9
        - smartphone_vertical_9_20
        - standard_3_2
        - portrait_2_3
        - horizontal_2_1
        - vertical_1_2
        - social_5_4
        - social_post_4_5
      example: square_1_1
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
    request_content_styling_effects:
      properties:
        color:
          description: Effects - Color to apply to the image
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
          example: b&w
          type: string
        lightning:
          description: Effects - Lightning to apply to the image
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
          description: Effects - Framing to apply to the image
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
    request_content_styling:
      properties:
        style:
          description: Style to apply to the image
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
        colors:
          description: Dominant colors to generate the image
          items:
            $ref: '#/components/schemas/colors_palette_inner'
          maxItems: 5
          minItems: 1
          type: array
        effects:
          $ref: '#/components/schemas/request_content_styling_effects'
      type: object
    meta_image:
      allOf:
        - $ref: '#/components/schemas/image_size'
        - properties:
            width:
              description: |
                Image width. If not present, default is `1024`.
                Valid values range `[1, 1792]`
              example: 1024
              maximum: 1792
              minimum: 1
              type: integer
            height:
              description: Image height
              example: 1024
              maximum: 1792
              minimum: 1
              type: integer
          required:
            - height
            - width
          type: object
      example:
        size: square_1_1
        width: 1024
        height: 1024
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