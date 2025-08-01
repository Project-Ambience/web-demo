require 'rails_helper'

RSpec.describe Conversation, type: :model do
  describe "associations" do
    it { should belong_to(:ai_model) }
    it { should have_many(:messages).dependent(:destroy) }
    it { should have_one_attached(:file) }
  end

  describe "enums" do
    it {
      should define_enum_for(:status).with_values(
        awaiting_prompt: 0,
        awaiting_feedback: 1,
        awaiting_rejection_comment: 2,
        completed: 3
      )
    }
  end

  describe "instance methods" do
    let(:conversation) { create(:conversation) }

    describe "#file_url" do
      it "returns nil if no file is attached" do
        expect(conversation.file_url).to be_nil
      end
    end

    describe "#file_name" do
      it "returns nil if no file is attached" do
        expect(conversation.file_name).to be_nil
      end
    end

    describe "#base_prompt and #first_response" do
      let(:conversation_with_messages) { create(:conversation) }

      before do
        create(:message, conversation: conversation_with_messages, content: "Hello")
        create(:message, conversation: conversation_with_messages, content: "Hi there")
      end

      it "returns the first message content as base_prompt" do
        expect(conversation_with_messages.base_prompt).to eq("Hello")
      end

      it "returns the second message content as first_response" do
        expect(conversation_with_messages.first_response).to eq("Hi there")
      end
    end
  end
end
