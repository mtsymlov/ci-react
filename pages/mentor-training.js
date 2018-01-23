/* global hScroller */
import React from 'react'
import Layout from '../components/Layout'
import StickyNav from '../components/StickyNav'
import Title from '../components/Title'
import 'isomorphic-fetch'
import { logPageView } from '../utils/analytics'

export default class extends React.Component {
  state = {
    data: [],
    dateSort: 'asc',
    dateAsc: null,
    dateDesc: null,
    dateIsAsc: true,
    userLat: null,
    userLong: null
  }

  static async getInitialProps () {
    const apiUrl = 'https://wp.catechetics.com/wp-json/wp/v2/'
    const params =
      'multiple-post-type?per_page=100&type[]=nearby-event&filter[orderby]=acf.date&filter[order]=ASC&fields=title,acf,slug,content,type,better_featured_image&type[]=page'
    const res = await fetch(apiUrl + params)
    const data = await res.json()
    return { data }
  }

  componentDidMount = () => {
    this.setState({
      data: this.props.data
        .filter(post => post.type === 'nearby-event')
        .filter(post => post.acf.date >= this.getTodaysDate())
        .sort((a, b) => a.acf.date - b.acf.date)
    })
    hScroller()
    logPageView()
  }

  getTodaysDate = () => {
    const date = new Date()
    const dateToday = parseInt(
      '' +
        date.getFullYear() +
        this.makeTwoDigits(date.getMonth() + 1) +
        this.makeTwoDigits(date.getDate())
    )
    return dateToday
  }

  getLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        userLat: position.coords.latitude,
        userLong: position.coords.longitude
      })
      this.compareLocation()
    })
  }

  compareLocation = () => {
    const newData = this.state.data
      .map(event => {
        const eventCloned = { ...event }
        eventCloned.distanceToEvent = eventCloned.acf.hasOwnProperty(
          'location_map'
        )
          ? this.state.userLat -
            eventCloned.acf.location_map.lat +
            (this.state.userLong - eventCloned.acf.location_map.lng)
          : Infinity
        return eventCloned
      })
      // Make sure to set a distanceToEvent value for events that do not have lat and lon. Set to Infinity
      .sort((a, b) => a.distanceToEvent - b.distanceToEvent)
    this.setState({ data: newData })
  }

  sortDate = () => {
    const newData = this.state.data.sort(
      (a, b) =>
        this.state.dateSort === 'desc'
          ? a.acf.date - b.acf.date
          : b.acf.date - a.acf.date
    )
    this.setState({
      data: newData,
      dateSort: this.state.dateSort === 'asc' ? 'desc' : 'asc'
    })
  }

  handleSort = sortBy => {
    switch (sortBy) {
      case 'date':
        this.sortDate()
        break

      case 'location':
        this.getLocation()
        break

      default:
        this.sortDate()
    }
  }

  makeTwoDigits (n) {
    return n.toString().length <= 1 ? '0' + n : n
  }

  render () {
    return (
      <Layout
        headerType='interior'
        title='Mentor Training | Catechetical Institute at Franciscan University'
        description='Upcoming mentor training sessions from the Catechetical Institute at Franciscan University of Steubenville'
      >
        <main id='events'>
          <StickyNav />
          <Title
            title='Mentor Training'
            imgPath='/static/img/campus-7.jpg'
            posY='-44vh'
          />
          <div className='section white-background-flourish'>
            <div className='container'>
              <div className='row'>
                {this.props.data
                  .filter(post => post.slug === 'mentor-training-intro')
                  .map(post => (
                    <div
                      key={post.id}
                      className='col s12 flow-text'
                      dangerouslySetInnerHTML={{
                        __html: post.content.rendered
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
          <div className='section valign-wrapper black-text white-background-flourish'>
            <div className='valign container wide-container'>
              <h4 className='light center' style={{ marginBottom: '8px' }}>
                Find a Mentor Training Session
              </h4>
              <div className='row light'>
                <table className='highlight responsive-table'>
                  <thead>
                    <tr>
                      <th onClick={() => this.handleSort('date')}>Date</th>
                      <th>Presenter</th>
                      <th>Training/Title</th>
                      <th onClick={this.getLocation}>Location</th>
                      <th>Event Email</th>
                      <th>Presenter Email</th>
                      <th>Link</th>
                    </tr>
                  </thead>

                  <tbody>
                    {this.state.data.map(function (post, i) {
                      return (
                        <tr key={i}>
                          <td>{post.acf.displayed_date}</td>
                          <td>{post.acf.presenter}</td>
                          <td
                            dangerouslySetInnerHTML={{
                              __html: post.title.rendered
                            }}
                          />
                          <td>{post.acf.location}</td>
                          <td class='event-email-td'>
                            <a href={`mailto:${post.acf.event_email}`}>
                              {post.acf.event_email}
                            </a>
                          </td>
                          <td class='presenter-email-td'>
                            <a href={`mailto:${post.acf.presenter_email}`}>
                              {post.acf.presenter_email}
                            </a>
                          </td>
                          <td>
                            <a
                              href={post.acf.link}
                              title={post.title.rendered}
                              target='_blank'
                            >
                              {post.acf.link ? 'More Info' : ''}
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className='col s12 center scroller'>
                  <svg
                    id='scrollLeft'
                    fill='#000000'
                    height='24'
                    viewBox='0 0 24 24'
                    width='24'
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ transform: 'rotate(180deg)' }}
                  >
                    <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
                    <path d='M0 0h24v24H0z' fill='none' />
                  </svg>
                  <svg
                    id='scrollRight'
                    fill='#000000'
                    height='24'
                    viewBox='0 0 24 24'
                    width='24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
                    <path d='M0 0h24v24H0z' fill='none' />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className='section valign-wrapper black-text white-background-flourish'>
            <div className='valign container wide-container'>
              <h4 className='light center' style={{ marginBottom: '8px' }}>
                Request a Mentor Training
              </h4>
              <div className='row'>
                <div class='input-field col s12'>
                  <i class='material-icons prefix'>mode_edit</i>
                  <input id='email' type='email' />
                  <label for='email'>Email</label>
                </div>
                <div class='input-field col s12'>
                  <i class='material-icons prefix'>mode_edit</i>
                  <textarea id='request' class='materialize-textarea' />
                  <label for='request'>Request</label>
                  <div class='center'>
                    <div class='btn' id='announcement-submit'>
                      Submit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style jsx>
            {`
              .responsive-table {
                font-size: 24px;
              }

              @media screen and (max-width: 600px) {
                .responsive-table {
                  font-size: 18px;
                }

                .responsive-table thead {
                  max-width: 103px;
                }

                .responsive-table .event-email-td, .responsive-table .presenter-email-td {
                  min-height: 84px;
                }
              }
                .responsive-table td, .responsive-table th {
                  min-height: 66px;
                }

                .scroller {
                  margin-bottom: -28px;
                }

                .scroller svg {
                  width: 65px;
                  height: 60px;
                  cursor: pointer;
              `}
          </style>
        </main>
      </Layout>
    )
  }
}
