var builder = WebApplication.CreateBuilder(args);

// הוסף תמיכה ב־Controllers
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<UserService>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// חובה כדי ש־Controllers יעבדו
app.UseAuthorization();
app.MapControllers();

app.Run();
