# -*- coding: utf-8 -*-
# Generated by Django 1.11.13 on 2018-06-28 05:18
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_ordermanager'),
    ]

    operations = [
        migrations.DeleteModel(
            name='OrderManager',
        ),
    ]
