# == Schema Information
#
# Table name: analytics_dimension_dates
#
#  id    :uuid             not null, primary key
#  date  :date
#  year  :string
#  month :string
#  day   :string
#
module Analytics
  class DimensionDate < Analytics::ApplicationRecord

  end
end
