# Remove the background of an image

> This endpoint removes the background from an image provided via a URL. The URLs in the response are temporary and valid for **5 minutes** only.

## OpenAPI

````yaml post /v1/ai/beta/remove-background
paths:
  path: /v1/ai/beta/remove-background
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
      application/x-www-form-urlencoded:
        schemaArray:
          - type: object
            properties:
              image_url:
                allOf:
                  - description: The URL of the image whose background needs to be removed.
                    example: >-
                      https://img.freepik.com/free-vector/cute-cat-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4148.jpg?w=2000&t=st=1725353998~exp=1725357598~hmac=a17f90afeeff454b36c0715f84eed2b388cd9c4a7ce59fcdff075fa41770e469
                    format: uri
                    type: string
            required: true
            refIdentifier: '#/components/schemas/remove_image_background_request'
        examples:
          example:
            value:
              image_url: >-
                https://img.freepik.com/free-vector/cute-cat-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4148.jpg?w=2000&t=st=1725353998~exp=1725357598~hmac=a17f90afeeff454b36c0715f84eed2b388cd9c4a7ce59fcdff075fa41770e469
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              original:
                allOf:
                  - description: URL of the original image.
                    format: uri
                    type: string
              high_resolution:
                allOf:
                  - description: >-
                      URL of the high-resolution image with the background
                      removed.
                    format: uri
                    type: string
              preview:
                allOf:
                  - description: URL of the preview version of the image.
                    format: uri
                    type: string
              url:
                allOf:
                  - description: Direct URL for downloading the high-resolution image.
                    format: uri
                    type: string
            refIdentifier: '#/components/schemas/remove_image_background_200_response'
            example:
              original: >-
                https://api.freepik.com/v1/ai/beta/images/original/037ea4ea-e8ad84a8c7/thumbnail.jpg
              high_resolution: >-
                https://api.freepik.com/v1/ai/beta/images/download/037ead-44cd8ad84a8c7/high.png
              preview: >-
                https://api.freepik.com/v1/ai/beta/images/download/037ea4eacad84a8c7/preview.png
              url: >-
                https://api.freepik.com/v1/ai/beta/images/download/037ea4ea-720d-411e8ad84a8c7/high.png
        examples:
          example:
            value:
              original: >-
                https://api.freepik.com/v1/ai/beta/images/original/037ea4ea-e8ad84a8c7/thumbnail.jpg
              high_resolution: >-
                https://api.freepik.com/v1/ai/beta/images/download/037ead-44cd8ad84a8c7/high.png
              preview: >-
                https://api.freepik.com/v1/ai/beta/images/download/037ea4eacad84a8c7/preview.png
              url: >-
                https://api.freepik.com/v1/ai/beta/images/download/037ea4ea-720d-411e8ad84a8c7/high.png
        description: Successful background removal.
  deprecated: false
  type: path
components:
  schemas: {}

````