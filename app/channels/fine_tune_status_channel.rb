class FineTuneStatusChannel < ApplicationCable::Channel
  def subscribed
    stream_from "fine_tune_status_updates"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
