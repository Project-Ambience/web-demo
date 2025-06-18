require "rails_helper"

RSpec.describe ModelInstallRequest, type: :model do
  let(:clinician_type) { create(:clinician_type) }
  let(:model_install_request) { create(:model_install_request, clinician_type: clinician_type) }

  describe "associations" do
    it { is_expected.to belong_to(:clinician_type) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_presence_of(:path) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status).with_values(pending: 0, in_progress: 1, done: 2, failed: 3) }
  end

  describe "callbacks" do
    describe "after_initialize" do
      it "sets default status to pending for new records" do
        request = ModelInstallRequest.new
        expect(request.status).to eq("pending")
      end

      it "does not override status if already set" do
        request = ModelInstallRequest.new(status: :done)
        expect(request.status).to eq("done")
      end
    end

    describe "after_create" do
      let(:service_url) { "http://fake-service.com/install" }

      before do
        stub_const("ENV", ENV.to_hash.merge("MODEL_INSTALLER_SERVICE_PATH" => service_url))
      end

      context "when the service responds with 200" do
        before do
          stub_request(:post, service_url)
            .to_return(status: 200, body: "", headers: {})
        end

        it "sets status to done" do
          request = create(:model_install_request)
          expect(request.reload.status).to eq("done")
        end
      end

      context "when the service responds with non-200" do
        before do
          stub_request(:post, service_url)
            .to_return(status: 500, body: "", headers: {})
        end

        it "sets status to failed" do
          request = create(:model_install_request)
          expect(request.reload.status).to eq("failed")
        end
      end
    end
  end
end
