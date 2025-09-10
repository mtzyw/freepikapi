# Create image from text - Mystic

> Convert descriptive text input into images using AI. This endpoint accepts a variety of parameters to customize the generated images.

## OpenAPI

````yaml post /v1/ai/mystic
paths:
  path: /v1/ai/mystic
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
                      ### AI Model Prompt Description


                      The prompt is a short text that describes the image you
                      want to generate. It can range from simple descriptions,
                      like `"a cat"`, to detailed scenarios, such as `"a cat
                      with wings, playing the guitar, and wearing a hat"`. If no
                      prompt is provided, the AI will generate a random image.


                      #### Adding Characters to the Prompt

                      You can introduce characters into the prompt using the
                      following syntax:

                      - `@character_name`: Represents the character you want to
                      include.
                        Example: `My friend @john is a great artist.`

                      #### Modifying Character Strength

                      To adjust the influence or "strength" of a character in
                      the image, use the following syntax:

                      - `@character_name::strength`: Specify the character's
                      strength by appending `::strength` to their name, where
                      `strength` is a numerical value.
                        Example: `My friend @john::200 is a great artist.`

                      Higher strength values will make the character more
                      prominent in the generated image.
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
              structure_reference:
                allOf:
                  - description: >
                      ### Structure Reference

                      Base64 image to use as structure reference. Using images
                      as structure references allows you to influence the shape
                      of your final image. This feature enables various creative
                      applications such as coloring sketches, transforming
                      cartoons into realistic images, texturing basic 3D models,
                      or converting real images into cartoons. The outcome is
                      entirely controlled by your prompt, offering limitless
                      creative possibilities.
                    format: byte
                    type: string
              structure_strength:
                allOf:
                  - default: 50
                    description: >
                      Note: This parameter only takes effect when a
                      `"structure_reference"` image is provided.

                      Allows to maintain the structure of the original image.
                    maximum: 100
                    minimum: 0
                    type: integer
              style_reference:
                allOf:
                  - description: >
                      ### Style Reference

                      Base64 image to use as style reference. Using images as
                      style references allows you to influence the aesthetic of
                      your creation. This is possibly the most powerful tool of
                      Mystic, as it truly lets you create incredibly unique
                      images.
                    format: byte
                    type: string
              adherence:
                allOf:
                  - default: 50
                    description: >
                      Note: This parameter only takes effect when a
                      `"style_reference"` image is provided.

                      Increasing this value will make your generation more
                      faithful to the prompt, but it may transfer the style a
                      bit less accurately. Higher values can help fix small
                      artifacts, anatomical errors and text readability. Lower
                      values will give you more creative images and closer to
                      the style reference.
                    maximum: 100
                    minimum: 0
                    type: integer
              hdr:
                allOf:
                  - default: 50
                    description: >
                      Note: This parameter only takes effect when a
                      `"style_reference"` image is provided.

                      Increasing this value can give you a more detailed image,
                      at the cost of a more 'AI look' and slightly worse style
                      transfer. Lower values have a more natural and artistic
                      look but may increase artifacts.
                    maximum: 100
                    minimum: 0
                    type: integer
              resolution:
                allOf:
                  - default: 2k
                    description: Resolution of the image
                    enum:
                      - 1k
                      - 2k
                      - 4k
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
                      - social_post_4_5'
                    example: square_1_1
                    type: string
              model:
                allOf:
                  - default: realism
                    description: >
                      * `zen` - for smoother, basic, and cleaner results. Fewer
                      objects in the scene and less intricate details. The
                      softer looking one.

                      * `fluid` -  the model that adheres best to prompts with
                      great average quality for all kind of images. It can
                      generate really creative images! It will always follow
                      your input no matter what. However, since it is using
                      Google's Imagen 3, it is a bit over-moderated, and some
                      simple prompts containing words like "war" may be flagged
                      and not generated (sorry about that! But there's nothing
                      we can do!).

                      * `realism` -  with a more realistic color palette. It
                      tries to give an extra boost of reality to your images, a
                      kind of "less AI look". Works especially well with
                      photographs but also magically works with illustrations
                      too.


                      `IMPORTANT`: You should use Zen or Fluid if you are trying
                      to generate something that is really fantastic or a known
                      character, Realism may not follow your prompt well.
                    enum:
                      - realism
                      - fluid
                      - zen
                    type: string
              creative_detailing:
                allOf:
                  - default: 33
                    description: >
                      Higher values can achieve greater detail per pixel at
                      higher resolutions at the cost of giving a somewhat more
                      "HDR" or artificial look.

                      Very high values can generate quite crazy things like eyes
                      where they shouldn't appear, etc.


                      Valid values range `[0, 100]`, default `33`
                    maximum: 100
                    minimum: 0
                    type: integer
              engine:
                allOf:
                  - default: automatic
                    description: |
                      Select the engine for the AI model. Available options:
                        * `automatic` - default choice
                        * `Illusio` - for smoother illustrations, landscapes, and nature. The softer looking one.
                        * `Sharpy` - better for realistic images like photographs and for a more grainy look. It provides the sharpest and most detailed images. If you use it for illustrations it will give them more texture and a less softer look.
                        * `Sparkle` - also good for realistic images. It's a middle ground between Illusio and Sharpy.
                    enum:
                      - automatic
                      - magnific_illusio
                      - magnific_sharpy
                      - magnific_sparkle
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
              filter_nsfw:
                allOf:
                  - default: true
                    description: >
                      Controls **NSFW** (Not Safe For Work) content filtering
                      during generation.


                      This parameter is always set to `true` by default and NSFW
                      filtering **cannot be disabled** for standard API usage.
                      Only authorized clients with special permissions can
                      disable this filter.


                      **Important:** If your use case requires disabling NSFW
                      filtering, please contact our support team to discuss your
                      requirements and potential authorization.
                    type: boolean
              styling:
                allOf:
                  - $ref: '#/components/schemas/mystic_request_styling'
            refIdentifier: '#/components/schemas/mystic-request'
        examples:
          example:
            value:
              prompt: <string>
              webhook_url: https://www.example.com/webhook
              structure_reference: aSDinaTvuI8gbWludGxpZnk=
              structure_strength: 50
              style_reference: aSDinaTvuI8gbWludGxpZnk=
              adherence: 50
              hdr: 50
              resolution: 2k
              aspect_ratio: square_1_1
              model: realism
              creative_detailing: 33
              engine: automatic
              fixed_generation: false
              filter_nsfw: true
              styling:
                styles:
                  - name: <string>
                    strength: 100
                characters:
                  - id: <string>
                    strength: 100
                colors:
                  - color: '#FF0000'
                    weight: 0.5
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
        description: OK - The request has succeeded and the Mystic process has started.
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
    mystic_request_styling_styles_inner:
      properties:
        name:
          description: >
            Name of the style to apply.

            **The name of the style can be found in the `v1/ai/loras`
            endpoint.**
          type: string
        strength:
          default: 100
          description: >
            Strength of the style to apply. The higher the value, the more the
            style will be applied to the image. Some styles may not be affected
            by this parameter.


            Valid values range `[0, 200]`. Default value is `100`.
          maximum: 200
          minimum: 0
          type: number
      required:
        - name
      type: object
    mystic_request_styling_characters_inner:
      properties:
        id:
          description: |
            ID of the character to modify.
            **This ID can be found in the `v1/ai/loras` endpoint.**
          type: string
        strength:
          default: 100
          description: >
            Strength of the character to apply. The higher the value, the more
            the character will be applied to the image.

            If ID is not set, the strength will be applied to the character
            specified in the `prompt` field.


            Valid values range `[0, 200]`. Default value is `100`.
          maximum: 200
          minimum: 0
          type: number
      required:
        - strength
      type: object
    mystic_request_styling:
      description: Styling options for the image
      properties:
        styles:
          items:
            $ref: '#/components/schemas/mystic_request_styling_styles_inner'
          maxItems: 1
          type: array
        characters:
          description: >-
            Modify the characters introduced in the `prompt` field adjusting
            their strength
          items:
            $ref: '#/components/schemas/mystic_request_styling_characters_inner'
          maxItems: 1
          type: array
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