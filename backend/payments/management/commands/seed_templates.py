from django.core.management.base import BaseCommand
from payments.models import JobTemplate


TEMPLATES = [
    ('Framing', 'labor'),
    ('Drywall', 'labor'),
    ('Electrical', 'labor'),
    ('Plumbing', 'labor'),
    ('Roofing', 'labor'),
    ('Painting', 'labor'),
    ('Demolition', 'labor'),
    ('Concrete', 'materials'),
]


class Command(BaseCommand):
    help = 'Seed default job templates'

    def handle(self, *args, **options):
        for name, category in TEMPLATES:
            _, created = JobTemplate.objects.get_or_create(
                name=name,
                defaults={'default_category': category},
            )
            if created:
                self.stdout.write(f'  Created: {name}')
            else:
                self.stdout.write(f'  Exists: {name}')
        self.stdout.write(self.style.SUCCESS('Job templates seeded.'))
