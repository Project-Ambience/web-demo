class Api::RagDataAddingRequestsController < Api::ApplicationController
  def create
    rag_data_adding_request = RagDataAddingRequest.create!

    if params.dig(:file).present?
      rag_data_adding_request.file.attach(params.dig(:file))
    end

    begin
      response = HTTParty.post(
        ENV["RAG_DATA_ADDING_PATH"],
        body: { "files" => rag_data_adding_request.file_url },
        headers: { "X-API-Key" => ENV["RAG_DATA_ADDING_API_KEY"] }
      )

      if response.code.to_i == 200
        rag_data_adding_request.done!
        render json: rag_data_adding_request, status: :created
      else
        rag_data_adding_request.failed!
        rag_data_adding_request.update!(error_log: "RAG service return #{response.code.to_i}")
        render json: { error: "Fail to add data to RAG" }, status: :bad_request
      end

    rescue StandardError => e
      rag_data_adding_request.failed!
      rag_data_adding_request.update!(error_log: e.message)
      render json: { error: "Unexpected error while adding data to RAG" }, status: :bad_request
    end
  end
end
