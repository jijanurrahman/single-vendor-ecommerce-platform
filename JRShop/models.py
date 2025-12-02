from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField()

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name
    
class Product(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Original price")
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Discounted price (leave blank if no discount)")
    stock = models.PositiveBigIntegerField(default=0)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='products/%Y/%m/%d')

    def __str__(self):
        return self.name
    
    def get_discount_percentage(self):
        """Calculate discount percentage"""
        if self.discount_price and self.price > 0:
            discount = ((self.price - self.discount_price) / self.price) * 100
            return int(discount)
        return 0
    
    def has_discount(self):
        """Check if product has discount"""
        return self.discount_price is not None and self.discount_price < self.price
    
    def get_final_price(self):
        """Get the price to display (discount if available, else original)"""
        if self.has_discount():
            return self.discount_price
        return self.price
    
    def average_ratings(self):
        ratings = self.ratings.all()
        if ratings.count() > 0:
            return sum([rating.rating for rating in ratings])/ratings.count()
    

class Rating(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} - {self.rating}"
    
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart - {self.user.username}"
    
    def get_total_price(self):
        return sum(item.get_cost() for item in self.items.all())
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveBigIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} X {self.product.name}"
    
    def get_cost(self):
        return self.quantity * self.product.get_final_price()

class Order(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('canceled', 'Canceled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=11)
    address = models.TextField()
    postal_code = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    note = models.TextField(blank=True, null=True)
    transaction_id = models.CharField(max_length=150, blank=True, null=True)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=15, choices=STATUS, default='pending')

    def __str__(self):
        return f"Order #{self.id}"
    
    def get_total_cost(self):
        return sum(item.get_cost() for item in self.order_items.all())
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveBigIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def get_cost(self):
        return self.quantity * self.price



