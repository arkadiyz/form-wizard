using Microsoft.AspNetCore.Mvc;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetForms()
        {
            var forms = new[]
            {
                new { Id = 1, Name = "Contact Form" },
                new { Id = 2, Name = "Registration Form" }
            };

            return Ok(forms);
        }
    }
}
