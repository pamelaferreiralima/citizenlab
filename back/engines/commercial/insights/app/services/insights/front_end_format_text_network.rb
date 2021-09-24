# frozen_string_literal: true

require 'insights/min_max_scaler'

module Insights
  # = FrontEndFormatTextNetwork
  #
  # This class implements a representation for text networks that is convenient
  # to work with for the front-end.
  class FrontEndFormatTextNetwork
    DEFAULT_KEYWORD_SIZE_RANGE = [1, 5].freeze
    DEFAULT_CLUSTER_SIZE_RANGE = [100, 500].freeze

    attr_reader :id

    # @param [Insights::View] view
    def initialize(
      view, keyword_size_range: DEFAULT_KEYWORD_SIZE_RANGE, cluster_size_range: DEFAULT_CLUSTER_SIZE_RANGE
    )
      @id = "network-#{view.id}"
      @network = NLP::TextNetwork.merge(
        # Namespacing networks wrt to the language to avoid id collisions.
        *view.text_networks.map { |tn| tn.network.namespace(tn.language) }
      )

      @keyword_size_range = keyword_size_range
      @cluster_size_range = cluster_size_range
    end

    # @return [Array<Hash>]
    def nodes
      @nodes ||= self.class.nodes(@network, @keyword_size_range, @cluster_size_range)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<Hash>]
    def self.nodes(
      network, keyword_size_range = DEFAULT_KEYWORD_SIZE_RANGE, cluster_size_range = DEFAULT_CLUSTER_SIZE_RANGE
    )
      keyword_nodes(network, keyword_size_range) + cluster_nodes(network, cluster_size_range)
    end

    # @param [NLP::TextNetwork] network
    # @param [Array(Numeric, Numeric)] val_range range of the +val+ attribute after rescaling
    # @return [Array<Hash>]
    def self.cluster_nodes(network, val_range = DEFAULT_CLUSTER_SIZE_RANGE)
      nodes = network.communities.map.with_index do |community, i|
        {
          id: community.id,
          name: community_name(community),
          val: community.importance_score,
          cluster_id: nil,
          color_index: i
        }
      end

      rescale_node_vals(nodes, val_range)
    end

    # @param [NLP::TextNetwork::Community] community
    # @param [Integer] n
    # @return [String]
    def self.community_name(community, n = 3)
      community.children
               .sort_by(&:importance_score).reverse
               .take(n)
               .map(&:name).join(', ')
    end

    # @param [NLP::TextNetwork] network
    # @param [Array(Numeric, Numeric)] val_range range of the +val+ attribute after rescaling
    # @return [Array<Hash>]
    def self.keyword_nodes(network, val_range = DEFAULT_KEYWORD_SIZE_RANGE)
      nodes = network.communities.flat_map.with_index do |community, i|
        community.children.map do |node|
          {
            id: node.id,
            name: node.name,
            val: node.importance_score,
            cluster_id: community.id,
            color_index: i
          }
        end
      end

      rescale_node_vals(nodes, val_range)
    end

    def self.rescale_node_vals(nodes, output_range)
      input_range = nodes.pluck(:val).minmax
      scaler = Insights::MinMaxScaler.new(input_range, output_range)
      nodes.each { |node| node[:val] = scaler.transform(node[:val]) }
    end

    def links
      @links ||= self.class.links(@network)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<{Symbol=>String}>]
    def self.links(network)
      cluster_membership_links(network) + inter_cluster_links(network)
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<{Symbol=>String}>]
    def self.cluster_membership_links(network)
      network.communities.flat_map do |community|
        community.children.map { |node| { source: community.id, target: node.id } }
      end
    end

    # @param [NLP::TextNetwork] network
    # @return [Array<{Symbol=>String}>]
    def self.inter_cluster_links(network)
      links_index = network.links.group_by do |link|
        [link.from_id, link.to_id].sort
      end

      community_pairs = network.communities.combination(2).select do |c1, c2|
        c1.children_ids.product(c2.children_ids).any? do |id_pair|
          links_index[id_pair.sort]
        end
      end

      community_pairs.map { |c1, c2| { source: c1.id, target: c2.id } }
    end
  end
end
