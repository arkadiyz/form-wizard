using Server.Services.Interfaces;
using Server.Services.Implementations;
using Server.Services;

var builder = WebApplication.CreateBuilder(args);

// הוסף תמיכה ב־Controllers
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// הוסף Memory Cache עבור Reference Data
builder.Services.AddMemoryCache();

// הגדרת שירותים
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<FormService>();
builder.Services.AddScoped<IFormStateService, FormStateService>();
builder.Services.AddScoped<IReferenceDataService, ReferenceDataService>();

// הגדרת CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// הפעלת CORS
app.UseCors("AllowReactApp");

// חובה כדי ש־Controllers יעבדו
app.UseAuthorization();
app.MapControllers();

app.Run();
