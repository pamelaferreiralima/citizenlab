class WebApi::V1::NavBarItemSerializer < ::WebApi::V1::BaseSerializer
  attributes :title_multiloc, :code, :ordering, :created_at, :updated_at
  belongs_to :page, serializer: WebApi::V1::PageSerializer
end
