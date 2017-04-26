import fs from 'fs-extra'
import path from 'path-extra'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import FontAwesome from 'react-fontawesome'
import { Nav, NavItem, Col, Grid, Table, Collapse } from 'react-bootstrap'
import { SlotitemIcon, MaterialIcon } from 'views/components/etc/icon'
import _ from 'lodash'

import { Divider } from './Divider'
import UseitemIcon from './useitem-icon'
import { ItemInfoRow } from './ItemInfoRow'

const { $, __, __r, config } = window

const dataJson = fs.readJsonSync(path.join(__dirname, '..', 'assets', 'data.json'))
const DATA = _.sortBy(dataJson, ['icon', 'id'])
const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const queryData = id => _.find(DATA, item => item.id === id)

// React Elements
const DetailRow = (props) => {
  const data = queryData(props.id)
  const result = []
  for (const improvement of data.improvement) {
    const hishos = []
    for (const req of improvement.req) {
      for (const secretary of req.secretary) {
        // day = -1 means show all items
        if (props.day === -1) {
          hishos.push({
            name: (__(window.i18n.resources.__(secretary))),
            day: req.day,
          })
        } else if (req.day[props.day]) {
          hishos.push({
            name: (__(window.i18n.resources.__(secretary))),
            day: req.day,
          })
        }
      }
    }

    // skip the entry if no secretary availbale for chosen day
    if (hishos.length === 0) {
      continue
    }

    improvement.consume.material.forEach((mat, index) => {
      if (mat.improvement[0]) {
        result.push(
          <MatRow
            stage={index}
            development={mat.development}
            improvement={mat.improvement}
            item={mat.item}
            useitem={mat.useitem}
            upgrade={improvement.upgrade}
            hishos={hishos}
            day={props.day}
            key={`${index}-${props.day}-${JSON.stringify(hishos)}`}
          />
        )
      }
    })
  }

  return (
    <tr>
      <td colSpan={3} className="detail-td">
        <Collapse in={props.rowExpanded}>
          <div>
            <Table width="100%" bordered condensed className="detail-table">
              <thead>
                <tr>
                  <th style={{ width: '20%' }} />
                  <th style={{ width: '33%' }}>
                    <span><MaterialIcon materialId={1} />{data.improvement[0].consume.fuel}</span>
                    <span><MaterialIcon materialId={2} />{data.improvement[0].consume.ammo}</span>
                    <span><MaterialIcon materialId={3} />{data.improvement[0].consume.steel}</span>
                    <span><MaterialIcon materialId={4} />{data.improvement[0].consume.bauxite}</span>
                  </th>
                  <th style={{ width: '7%' }}><MaterialIcon materialId={7} /></th>
                  <th style={{ width: '7%' }}><MaterialIcon materialId={8} /></th>
                  <th style={{ width: '33%' }}>{__('Equipment')}</th>
                </tr>
              </thead>
              <tbody>
                {result}
              </tbody>
            </Table>
          </div>
        </Collapse>
      </td>
    </tr>
  )
}

const MatRow = (props) => {
  const rowCnt = props.upgrade.icon !== 0 ? 3 : 2

  let hishoCol = ''
  if (props.day === -1) {
    hishoCol = props.hishos.map((hisho, index) => {
      let days = []
      hisho.day.forEach((v, i) => { if (v) days.push(__(WEEKDAY[i])) })
      if (days.length == 7) {
        days = ''
      } else {
        days = `(${days.join(' / ')})`
      }
      return (
        <div className={'hisho-col'} key={`${hisho.name}-${index}`}>
          {hisho.name}<br />
          <span className={'available-days'}>{days}</span>
        </div>
      )
    })
  } else {
    hishoCol = props.hishos.map((hisho, index) => <div key={`${hisho.name}-${index}`}>{hisho.name}</div>)
  }

  let stage = ''
  let star = ''
  switch (props.stage) {
    case 0:
      stage = <span><FontAwesome name="star" /> 1 ~ <FontAwesome name="star" /> 6 </span>
      break
    case 1:
      stage = <span><FontAwesome name="star" /> 6 ~ <FontAwesome name="star" /> MAX </span>
      break
    case 2:
      if (props.upgrade.level) {
        star = <span> <FontAwesome name="star" />{` ${props.upgrade.level}`}</span>
      }
      stage = (<div>
        <SlotitemIcon slotitemId={props.upgrade.icon} />
        {window.i18n.resources.__(props.upgrade.name)}
        {star}
      </div>)
      break
  }

  const useitem = props.useitem || {}

  return (
    <tr>
      {
        props.stage === 0 ?
          <td rowSpan={rowCnt}>{hishoCol}</td>
        : null
      }
      <td>
        {stage}
      </td>
      <td>
        {props.development[0]}({props.development[1]})
      </td>
      <td>
        {props.improvement[0]}({props.improvement[1]})
      </td>
      <td>
        <div>
          {
          props.item.icon ?
            <span>
              {props.item.count} ×
            <SlotitemIcon
              slotitemId={props.item.icon}
            />
              {__r(props.item.name)}
            </span> : ''
        }
        </div>
        <div>
          {
          useitem.icon ?
            <span>
              {useitem.count} ×
            <UseitemIcon
              useitemId={useitem.icon}
              className={'useitem'}
            />
              {__r(useitem.name)}
            </span> : ''
        }
        </div>
      </td>
    </tr>
  )
}


class ItemInfoArea extends Component {

  constructor(props) {
    super(props)

    let day = (new Date()).getUTCDay()
    if ((new Date()).getUTCHours() >= 15) {
      day = (day + 1) % 7
    }

    this.state = {
      day,
      highlights: config.get('plugin.ItemImprovement.highlights', []),
      rowsExpanded: {},
    }
  }


  getRows = () => {
    const day = this.state.day
    const rows = []

    for (const item of DATA) {
      const hishos = []
      for (const improvement of item.improvement) {
        for (const req of improvement.req) {
          for (const secretary of req.secretary) {
            // day = -1 means show all items
            if (day == -1) {
              hishos.push(__(window.i18n.resources.__(secretary)))
            } else if (req.day[day]) {
              hishos.push(__(window.i18n.resources.__(secretary)))
            }
          }
        }
      }
      const highlight = _.includes(this.state.highlights, item.id)
      if (hishos.length > 0) {
        const row = {
          id: item.id,
          icon: item.icon,
          type: window.i18n.resources.__(item.type),
          name: window.i18n.resources.__(item.name),
          hisho: hishos.join(' / '),
          highlight,
        }
        rows.push(row)
      }
    }
    return rows
  }

  handleKeyChange = (key) => {
    this.setState({
      day: key,
      rowsExpanded: {},
    })
  }

  handleClickItem = (id) => {
    let highlights = _.clone(this.state.highlights)
    if (_.includes(highlights, id)) {
      highlights = highlights.filter(v => v !== id)
    } else {
      highlights.push(id)
    }
    config.set('plugin.ItemImprovement.highlights', highlights)

    this.setState({
      highlights,
    })
  }

  handleRowExpanded = (id, expanded) => {
    const rowsExpanded = _.clone(this.state.rowsExpanded)
    rowsExpanded[id] = expanded
    this.setState({
      rowsExpanded,
    })
  }

  renderRows = () => {
    const rows = this.getRows()
    const highlighted = []
    const normal = []
    let result = []
    if (rows != null) {
      for (const row of rows) {
        const ref = row.highlight ? highlighted : normal

        const rowExpanded = this.state.rowsExpanded[row.id] || false
        ref.push(
          <ItemInfoRow
            key={row.id}
            icon={row.icon}
            type={row.type}
            name={row.name}
            hisho={row.hisho}
            highlight={row.highlight}
            clickCheckbox={this.handleClickItem.bind(this, row.id)}
            rowExpanded={rowExpanded}
            setExpanded={this.handleRowExpanded.bind(this, row.id)}
          />
        )
        ref.push(
          <DetailRow
            key={`detail-${row.id}`}
            id={row.id}
            icon={row.icon}
            type={row.type}
            name={row.name}
            rowExpanded={rowExpanded}
            day={this.state.day}

          />
        )
      }
      result = _.concat(highlighted, normal)
    }

    return (result)
  }


  render() {
    return (
      <Grid id="item-info-area">
        <div id="item-info-settings">
          <Divider text={__('Weekday setting')} />
          <Grid className="vertical-center">
            <Col xs={12}>
              <Nav bsStyle="pills" activeKey={this.state.day} onSelect={this.handleKeyChange}>
                <NavItem eventKey={0}>{__('Sunday')}</NavItem>
                <NavItem eventKey={1}>{__('Monday')}</NavItem>
                <NavItem eventKey={2}>{__('Tuesday')}</NavItem>
                <NavItem eventKey={3}>{__('Wednesday')}</NavItem>
                <NavItem eventKey={4}>{__('Thursday')}</NavItem>
                <NavItem eventKey={5}>{__('Friday')}</NavItem>
                <NavItem eventKey={6}>{__('Saturday')}</NavItem>
                <NavItem eventKey={-1}>{__('All')}</NavItem>
              </Nav>
            </Col>
          </Grid>
          <Divider text={__('Improvement information')} />
          <Grid>
            <Table bordered condensed hover id="main-table">
              <thead className="item-table">
                <tr>
                  <th style={{ width: '30%' }}><div style={{ paddingLeft: '55px' }}>{__('Type')}</div></th>
                  <th style={{ width: '40%' }}>{__('Name')}</th>
                  <th style={{ width: '30%' }}>{__('2nd Ship')}</th>
                </tr>
              </thead>
              <tbody>
                {this.renderRows()}
              </tbody>
            </Table>
          </Grid>
        </div>
      </Grid>
    )
  }
}

ReactDOM.render(<ItemInfoArea />, $('#item-improvement'))
