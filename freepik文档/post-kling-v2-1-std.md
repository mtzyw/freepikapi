# Create a video from an image - Kling 2.1 standard model

> Generate a video from an image using the Kling 2.1 Std model.

## OpenAPI

````yaml post /v1/ai/image-to-video/kling-v2-1-std
paths:
  path: /v1/ai/image-to-video/kling-v2-1-std
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
                      Reference Image. Supports Base64 encoding or URL (ensure
                      accessibility). For URL, must be publicly accessible. The
                      image file size cannot exceed 10MB, and the resolution
                      should not be less than 300x300px. Aspect ratio should be
                      between 1:2.5 ~ 2.5:1.
                    type: string
              prompt:
                allOf:
                  - description: >-
                      (`Required when image is not provided`) Text prompt
                      describing the desired motion, cannot exceed 2500
                      characters
                    type: string
              negative_prompt:
                allOf:
                  - description: >-
                      Text prompt describing what to avoid in the generated
                      video, cannot exceed 2500 characters
                    type: string
              duration:
                allOf:
                  - description: Duration of the generated video in seconds
                    enum:
                      - '5'
                      - '10'
                    type: string
              cfg_scale:
                allOf:
                  - default: 0.5
                    description: >-
                      Flexibility in video generation; The higher the value, the
                      lower the model's degree of flexibility, and the stronger
                      the relevance to the user's prompt.
                    format: float
                    maximum: 1
                    minimum: 0
                    type: number
              static_mask:
                allOf:
                  - description: >-
                      Static mask image for defining motion brush application
                      areas.


                      ● Supports both Base64 encoding and image URLs (ensure
                      URLs are publicly accessible and follow the same format
                      requirements as the `image` field).

                      ● Supported image formats include .jpg / .jpeg / .png.

                      ● The aspect ratio of the mask image MUST match the input
                      image (`image` field); otherwise, the task will fail.

                      ● The resolutions of the `static_mask` image and the
                      `dynamic_masks.mask` images must be identical; otherwise,
                      the task will fail.

                      ● The static brush feature allows you to define areas
                      where motion will be applied in the generated video.
                    type: string
              dynamic_masks:
                allOf:
                  - items:
                      $ref: >-
                        #/components/schemas/itvkp_request_content_dynamic_masks_inner
                    type: array
            required: true
            title: Image to Video
            refIdentifier: '#/components/schemas/itvkv2-1-request-content'
            requiredProperties:
              - duration
        examples:
          example:
            value:
              webhook_url: https://www.example.com/webhook
              image: <string>
              prompt: <string>
              negative_prompt: <string>
              duration: '5'
              cfg_scale: 0.5
              static_mask: <string>
              dynamic_masks:
                - mask: <string>
                  trajectories:
                    - x: 123
                      'y': 123
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
        description: OK - Get the status of the kling-std task
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
    itvkp_request_content_dynamic_masks_inner_trajectories_inner:
      properties:
        x:
          description: Horizontal coordinate (X-coordinate) in 2D pixel system.
          type: integer
        'y':
          description: Vertical coordinate (Y-coordinate) in 2D pixel system.
          type: integer
      required:
        - x
        - 'y'
      type: object
    itvkp_request_content_dynamic_masks_inner:
      properties:
        mask:
          description: >-
            Dynamic mask image for defining motion brush application areas with
            trajectories.


            ● Support inputting image Base64 encoding or image URL (ensure the
            URL is accessible and follows the same format requirements as the
            image field).

            ● Supported image formats include .jpg / .jpeg / .png

            ● The aspect ratio of the mask image must match the input image
            (image field); otherwise, the task will fail (failed).

            ● The resolutions of the static_mask image and the
            dynamic_masks.mask image must be identical; otherwise, the task will
            fail (failed).
          type: string
        trajectories:
          description: Motion Trajectory Coordinate Sequence
          items:
            $ref: >-
              #/components/schemas/itvkp_request_content_dynamic_masks_inner_trajectories_inner
          type: array
      required:
        - mask
        - trajectories
      type: object

````