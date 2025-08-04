class Api::RagDataAddingRequestsController < Api::ApplicationController
  def create
    rag_data_adding_request = RagDataAddingRequest.create!
    rag_data_adding_request.file.attach(params[:file]) if params[:file].present?

    response = HTTParty.post(
      ENV["RAG_DATA_ADDING_PATH"],
      body: {
        "files" => rag_data_adding_request.file_url
      },
      headers: {
        "X-API-Key" => ENV["RAG_DATA_ADDING_API_KEY"]
      }
    )

    if response.code.to_i == 200
      rag_data_adding_request.done!
      render json: rag_data_adding_request, status: :created
    else
      rag_data_adding_request.failed!
      render json: { error: "Fail to add data to RAG" }, status: :bad_request
    end
  end
end
