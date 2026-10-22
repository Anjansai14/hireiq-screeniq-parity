/**
 * Route mapping between HireIQ named routes and browser URLs.
 * Enables deep linking, browser back/forward, and backward compatibility with HQ.go(name, params).
 */

export function urlForRoute(name, params = {}) {
  switch (name) {
    case 'dashboard':
      return '/dashboard';
    case 'brief':
      return params.tab ? `/brief/${params.tab}` : '/brief';
    case 'newfilm':
      return '/brief';
    case 'campaigns':
      return '/campaigns';
    case 'wizard':
      return params.id ? `/campaigns/${params.id}/setup` : '/campaigns/new';
    case 'campaign':
      if (params.id && params.tab) {
        return `/campaigns/${params.id}/${params.tab}`;
      }
      return params.id ? `/campaigns/${params.id}` : '/campaigns';
    case 'influencer':
      if (params.campId && params.ccId) {
        const tabPart = params.tab ? `/${params.tab}` : '';
        return `/campaigns/${params.campId}/influencers/${params.ccId}${tabPart}`;
      }
      return '/campaigns';
    case 'creators':
      return params.filter ? `/creators?filter=${encodeURIComponent(params.filter)}` : '/creators';
    case 'creator':
      if (params.id && params.tab) {
        return `/creators/${params.id}/${params.tab}`;
      }
      return params.id ? `/creators/${params.id}` : '/creators';
    case 'copilot':
      return params.threadId ? `/copilot/${params.threadId}` : '/copilot';
    case 'files':
    case 'artifacts':
      return '/artifacts';
    case 'settings':
      return params.tab ? `/settings/${params.tab}` : '/settings/connectors';
    case 'login':
      return '/login';
    default:
      return '/dashboard';
  }
}
