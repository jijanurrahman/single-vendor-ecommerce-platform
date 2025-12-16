from django import template

register = template.Library()

@register.filter
def is_provider_configured(providers, provider_id):
    """
    Checks if a provider with the given ID exists in the list of providers.
    Usage: {% if providers|is_provider_configured:"google" %}
    """
    if not providers:
        return False
    for provider in providers:
        if provider.id == provider_id:
            return True
    return False
