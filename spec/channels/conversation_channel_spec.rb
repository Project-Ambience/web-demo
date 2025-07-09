require 'rails_helper'

RSpec.describe ConversationChannel, type: :channel do
  let(:conversation_id) { 42 }

  it "successfully subscribes and streams from the correct stream" do
    subscribe(conversation_id: conversation_id)

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_from("conversation_#{conversation_id}")
  end
end
