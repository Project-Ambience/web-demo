require "rails_helper"

RSpec.describe "ModelInstallRequests", type: :request do
  let(:clinician_type) { create(:clinician_type) }

  describe "POST api/model_install_requests/:id/update_status" do
    before do
      ENV["MODEL_INSTALLER_SERVICE_PATH"] = "http://example.com/models/install"
      ENV["MODEL_INSTALL_REQUEST_CALLBACK_PATH"] = "http://example.com/api/model_install_requests/update_status"
      stub_request(:post, ENV["MODEL_INSTALLER_SERVICE_PATH"] || "https://dummy-json.mock.beeceptor.com/posts")
        .with(
          body: hash_including("model_path" => "http://example.com/model"),
          headers: { 'Content-Type' => 'application/json' }
        )
        .to_return(status: 200, body: "", headers: {})
    end

    it "returns 404 if the request is not found" do
      post "/api/model_install_requests/update_status", params: { id: "999", status: "success" }
      expect(response).to have_http_status(:not_found)
    end

    it "returns 400 if the request is not in progress" do
      request = create(:model_install_request, clinician_type: clinician_type)
      request.done!
      post "/api/model_install_requests/update_status", params: { id: request.id, status: "success" }

      expect(response).to have_http_status(:bad_request)
    end

    it "updates status to done and creates AiModel on success" do
      request = create(:model_install_request, clinician_type: clinician_type, keyword: "example_keyword", path: "http://example.com/model")

      expect {
        post "/api/model_install_requests/update_status", params: { id: request.id, status: "success" }
      }.to change(AiModel, :count).by(1)

      expect(AiModel.last).to have_attributes(
        name: request.name,
        description: request.description,
        clinician_type_id: request.clinician_type_id,
        keywords: [ "example_keyword" ]
      )

      expect(response).to have_http_status(:ok)
      expect(request.reload.status).to eq("done")
    end

    it "updates status to failed on fail param" do
      request = create(:model_install_request, clinician_type: clinician_type)
      post "/api/model_install_requests/update_status", params: { id: request.id, status: "fail" }

      expect(response).to have_http_status(:ok)
      expect(request.reload.status).to eq("failed")
    end

    it "returns 422 for invalid status param" do
      request = create(:model_install_request, clinician_type: clinician_type)
      post "/api/model_install_requests/update_status", params: { id: request.id, status: "invalid" }
    end
  end
end
