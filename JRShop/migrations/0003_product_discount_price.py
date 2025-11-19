# Generated migration to add discount_price field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('JRShop', '0002_alter_cartitem_cart'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='discount_price',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Discounted price (leave blank if no discount)', max_digits=10, null=True),
        ),
    ]
