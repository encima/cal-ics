// Depends on ./ical_events.js

var recur_events = []

function an_filter(string) {
    // remove non alphanumeric chars
    return string.replace(/[^\w\s]/gi, '')
}

function moment_icaltime(moment, timezone) {
    // TODO timezone
    return new ICAL.Time().fromJSDate(moment.toDate())
}

 exports.expand_recur_events = function(start, end, timezone, events_callback) {
    events = []
    recur_events.forEach(function(event, i){
      event_properties = event.event_properties
      expand_recur_event(event, moment_icaltime(start, timezone), moment_icaltime(end, timezone), function(event){
        fc_event(event, function(event){
          events.push(merge_events(event_properties, merge_events({className:['recur-event']}, event)))
        })
      })
    })
    events_callback(events)
}

 exports.fc_events = function(ics, tz, event_properties) {
    events = []
    ical_events(
        ics,
        function(event){
            fc_event(event, tz, function(event){
                events.push(merge_events(event_properties, event))
            })
        },
        function(event){
            event.event_properties = event_properties
            recur_events.push(event)
        }
    )
    return events
}

 exports.merge_events = function(e, f) {
    // f has priority
    for (k in e) {
        if (k == 'className') {
            f[k] = [].concat(f[k]).concat(e[k])
        } else if (! f[k]) {
            f[k] = e[k]
        }
    }
    return f
}

 exports.fc_event = function(event, timezone, event_callback) {
    e = {
        title:event.getFirstPropertyValue('summary'),
        url:event.getFirstPropertyValue('url'),
        id:event.getFirstPropertyValue('uid'),
        timezone: timezone,
        className:['event-' + an_filter(event.getFirstPropertyValue('uid'))],
        allDay:false
    }
    try {
        e['start'] = event.getFirstPropertyValue('dtstart').toJSDate()
    } catch (TypeError) {
        console.debug('Undefined "dtstart", vevent skipped.')
        return
    }
    try {
        e['end'] = event.getFirstPropertyValue('dtend').toJSDate()
    } catch (TypeError) {
        e['allDay'] = true
    }
    event_callback(e)
}
