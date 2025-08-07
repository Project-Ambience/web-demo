require "rails_helper"

RSpec.describe Api::RagDataAddingRequestsController, type: :controller do
  describe "POST #create" do
    let(:mock_response) { instance_double(HTTParty::Response, code: response_code) }
    let(:file) do
      Rack::Test::UploadedFile.new(
        StringIO.new("dummy file content"),
        "text/plain",
        original_filename: "dummy.txt"
      )
    end

    before do
      allow(controller).to receive(:send_request).and_return(mock_response)
    end

    context "when RAG service returns 200" do
      let(:response_code) { 200 }

      it "marks request as done and returns created status" do
        post :create, params: { files: [ file ] }
        expect(RagDataAddingRequest.last).to be_done
        expect(response).to have_http_status(:created)
      end
    end

    context "when RAG service returns non-200" do
      let(:response_code) { 400 }

      it "marks request as failed and returns bad request" do
        post :create, params: { files: [ file ] }
        expect(response).to have_http_status(:bad_request)
        expect(RagDataAddingRequest.last).to be_failed
        expect(JSON.parse(response.body)).to include("error" => "Fail to add data to RAG")
      end
    end

    context "when an exception occurs" do
      before do
        allow(controller).to receive(:send_request).and_raise(StandardError, "boom")
      end

      let(:response_code) { 400 }

      it "marks request as failed and logs the error" do
        post :create, params: { files: [ file ] }
        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)).to include("error" => "Unexpected error while adding data to RAG")
      end
    end
  end
end
