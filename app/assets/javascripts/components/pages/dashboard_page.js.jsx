var AppIcon = require('../app_icon.js.jsx')
var Bounty = require('../bounty.js.jsx')
var BountiesStore = require('../../stores/bounties_store.js')
var Nav = require('../nav.js.jsx')
var NavItem = require('../nav_item.js.jsx')
var NewsFeedItem = require('../news_feed/news_feed_item.js.jsx')
var NewsFeedItemsStore = require('../../stores/news_feed_items_store.js')
var ProductsStore = require('../../stores/products_store.js')
var ProductChip = require('../product_chip.js.jsx')
var UserBountiesStore = require('../../stores/user_bounties_store.js')
var Tile = require('../ui/tile.js.jsx')

var MiniBounty = React.createClass({
  getDefaultProps: function() {
    return {
      locker: true
    }
  },

  render: function() {
    var bounty = this.props.bounty
    var locker = null

    if (this.props.locker && bounty.locker) {
      var locker = (
        <div className="px3 py2 border-top h6 mb0 mt0">
          <Avatar user={bounty.locker} size={18} style={{ display: 'inline-block' }} />
          {' '}
          <a href={bounty.locker.url} className="bold black">
            {bounty.locker.username}
          </a>
          {' '}
          <span className="gray-dark">
            has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
          </span>
        </div>
      )
    }

    return (
      <div className="mb2">
        <Tile>
          <div>
            <a className="block px3 py2 mt0 mb0 h5 fw-500 blue" href={bounty.url}>
              {bounty.title}
            </a>
          </div>
          {locker}
        </Tile>
      </div>
    )
  }
})

var DashboardPage = React.createClass({
  getDefaultProps: function() {
    return  {
      activeNavItem: 'all'
    }
  },

  getInitialState: function() {
    return {
      newsFeedItems: [],
      lockedBounties: [],
      reviewingBounties: [],
      products: []
    }
  },

  componentDidMount: function() {
    NewsFeedItemsStore.addChangeListener(this.getStateFromStore)
    ProductsStore.addChangeListener(this.getStateFromStore)
    UserBountiesStore.addChangeListener(this.getStateFromStore)

    this.getStateFromStore()
  },

  componentWillUnmount: function() {
    NewsFeedItemsStore.removeChangeListener(this.getStateFromStore)
    ProductsStore.removeChangeListener(this.getStateFromStore)
    UserBountiesStore.removeChangeListener(this.getStateFromStore)
  },

  renderProduct: function() {
    var activeNavItem = this.props.activeNavItem
    var product = _.find(this.props.followedProducts, function(product) {
      return product.slug == activeNavItem
    })

    if (product && !_.contains(['all', 'interests', 'following'], activeNavItem)) {
      return (
        <div className="mb3" style={{ marginTop: 42 }}>
          <Tile>
            <a href={product.url}>
              <div className="p3">
                <div className="clearfix">
                  <div className="left mr2">
                    <AppIcon app={product} size={36} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="h2 mt0 mb0 black bold">{product.name}</div>
                  </div>
                </div>
              </div>
            </a>

            <div className="border-bottom mt0 mb0"></div>
            <div className="stat-group p3 mb0">
              <div className="stat">
                <a className="block" href={product.wips_url}>
                  <div className="h4 mt0 mb0">{product.wips_count}</div>
                  <div className="gray-2">Bounties</div>
                </a>
              </div>
              <div className="stat">
                <a className="block" href={product.people_url}>
                  <div className="h4 mt0 mb0">{product.partners_count}</div>
                  <div className="gray-2">Contributors</div>
                </a>
              </div>
            </div>
          </Tile>
        </div>
      )
    }
  },

  renderNav: function() {
    var activeNavItem = this.props.activeNavItem
    var followedProducts = this.props.followedProducts
    var followingNavItem = null
    var divider = null

    if (followedProducts.length) {
      followingNavItem = <NavItem label="What you follow" href='/dashboard/following' active={activeNavItem == 'interests'} />
      divider = <NavItem divider={true} />
    }

    return (
      <Nav>
        <NavItem label="Everything"      href='/dashboard'           active={activeNavItem == 'all'} />
        <NavItem label="Your interests"  href='/dashboard/interests' active={activeNavItem == 'following'} />
        {followingNavItem}

        {divider}

        {followedProducts.map(function(product) {
          return <NavItem label={product.name} href={'/dashboard/' + product.slug } active={activeNavItem == product.slug} small={true} />
        })}
      </Nav>
    )
  },

  renderNewsFeedItems: function() {
    var items = this.state.newsFeedItems

    if (!items.length) {
      return this.renderSuggestProducts()
    } else {
      return (
        <div>
          {items.map(function(item) {
            return (
              <div>
                <NewsFeedItem {...item} />
              </div>
            )
          })}
        </div>
      )
    }
  },

  renderSuggestProducts: function() {
    var products = this.state.products

    return (
      <div>
        <div className="text-center mt4">
          <h3 className="gray-dark">You must be new around here.</h3>
          <p className="h4 mt0 mb0 gray-dark fw-400">Follow some products that you care about.</p>
        </div>

        <div className="mt4">
          {products.map(function(product) {
            return (
              <div className="mb2">
                <ProductChip product={product} />
              </div>
            )
          })}
        </div>
      </div>
    )
  },

  renderBounties: function() {
    if (!this.state.lockedBounties.length && !this.state.reviewingBounties) {
      return (
        <Tile>
          <div className="center p3">
            <p className="mt0 mb0 h5 gray-darker bold">Find a bounty to work on.</p>
            <p className="gray-dark mb0">There are plenty of products that could use your help.</p>
          </div>
          <div className="p3 center" style={{ backgroundColor: '#f9f9f9' }}>
            <a href="/discover/bounties" className="pill-button pill-button-theme-white pill-button-border pill-button-shadow bold" style={{ display: 'inline-block', lineHeight: '24px' }}>
              Find bounties
            </a>
          </div>
        </Tile>
      )
    }

    var lockedBounties = (
      <div className="mb3">
        <h6 className="gray caps mt2 mb2">Bounties you're working on</h6>
        {this.state.lockedBounties.map(function(bounty) {
          return <MiniBounty bounty={bounty} />
        })}
      </div>
    )

    var reviewingBounties = (
      <div className="mb3">
        <h6 className="gray caps mt2 mb2">Bounties in review</h6>
        {this.state.reviewingBounties.map(function(bounty) {
          return <MiniBounty bounty={bounty} locker={false} />
        })}
      </div>
    )

    var bounties = (
      <div>
        {lockedBounties}
        {reviewingBounties}
      </div>
    )

    return bounties
  },

  render: function() {
    var nav = this.renderNav()
    var newsFeedItems = this.renderNewsFeedItems()
    var product = this.renderProduct()
    var bounties = this.renderBounties()

    return (
      <div className="container clearfix mt1">
        <div className="mxn2">
          <div className="col col-2 px2">
            <div style={{ marginTop: 42 }}></div>
            {nav}
          </div>
          <div className="col col-6 px2">
            <h6 className="gray caps mt2 mb2">What's Happening</h6>
            {newsFeedItems}
          </div>
          <div className="col col-4 px2">
            {product}
            {bounties}
          </div>
        </div>
      </div>
    )
  },

  getStateFromStore: function() {
    this.setState({
      lockedBounties: UserBountiesStore.getLockedBounties(),
      reviewingBounties: UserBountiesStore.getReviewingBounties(),
      newsFeedItems: NewsFeedItemsStore.getNewsFeedItems(),
      products: ProductsStore.getProducts()
    })
  },
})

window.DashboardPage = module.exports = DashboardPage
