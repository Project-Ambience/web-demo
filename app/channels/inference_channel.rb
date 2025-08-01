class InferenceChannel < ApplicationCable::Channel
  def subscribed
    conversation_id = params[:conversation_id]
    stream_from "inference_#{conversation_id}"
  end
end
