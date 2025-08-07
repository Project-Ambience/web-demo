class Api::RagDataAddingRequestsController < Api::ApplicationController
  def create
    rag_data_adding_request = RagDataAddingRequest.create!

    if params[:files].present?
      params[:files].each do |file|
        rag_data_adding_request.files.attach(file)
      end
    end

    begin
      response = send_request(rag_data_adding_request)

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

  private

  def send_request(rag_data_adding_request)
    tempfiles = []
    boundary = "----RubyMultipartPost-#{SecureRandom.hex}"
    multipart_body = ""

    rag_data_adding_request.files.each_with_index do |file, i|
      tf = Tempfile.new([ "upload_#{i}", ".bin" ])
      tf.binmode
      tf.write(file.download)
      tf.rewind
      tempfiles << tf

      filename = file.filename&.to_s.presence || "request#{rag_data_adding_request.id}_file_#{file.id}.bin"
      content_type = file.content_type || "application/octet-stream"

      multipart_body << "--#{boundary}\r\n"
      multipart_body << "Content-Disposition: form-data; name=\"files\"; filename=\"#{filename}\"\r\n"
      multipart_body << "Content-Type: #{content_type}\r\n\r\n"
      multipart_body << tf.read
      multipart_body << "\r\n"
    end

    multipart_body << "--#{boundary}--\r\n"

    response = HTTParty.post(
      ENV["RAG_DATA_ADDING_PATH"],
      headers: {
        "Content-Type" => "multipart/form-data; boundary=#{boundary}",
        "accept" => "application/json",
        "X-API-Key" => ENV["RAG_DATA_ADDING_API_KEY"]
      },
      body: multipart_body
    )

    tempfiles.each do |tf|
      tf.close
      tf.unlink
    end

    response
  end
end
